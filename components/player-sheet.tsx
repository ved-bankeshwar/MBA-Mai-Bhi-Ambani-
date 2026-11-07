"use client"

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react"
import { pageShell, SiteHeader } from "@/components/site-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { professionById } from "@/lib/cards"
import { useDecks } from "@/lib/deck-store"
import { formatAmount, parseAmount } from "@/lib/money"
import {
  clearPlayer,
  getPlayerSnapshot,
  getServerPlayerSnapshot,
  readPlayer,
  savePlayer,
  subscribePlayer,
} from "@/lib/storage"
import { type LedgerKey, type LineItem, type PlayerState } from "@/lib/types"

const ledgers: { key: LedgerKey; title: string; hint: string }[] = [
  { key: "income", title: "Income", hint: "Salary, rent, dividends" },
  { key: "expenses", title: "Expenses", hint: "Taxes, EMIs, living costs" },
  { key: "assets", title: "Assets", hint: "Shares, property, businesses" },
  { key: "liabilities", title: "Liabilities", hint: "Loans you still owe" },
]

export function PlayerSheet() {
  const raw = useSyncExternalStore(
    subscribePlayer,
    getPlayerSnapshot,
    getServerPlayerSnapshot,
  )
  const state = useMemo(() => readPlayer(raw), [raw])
  const [chosenId, setChosenId] = useState<string | null>(null)
  const [lockOpen, setLockOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  function update(patch: (current: PlayerState) => PlayerState) {
    savePlayer(patch(readPlayer(getPlayerSnapshot())))
  }

  function lockProfession() {
    if (!chosenId) return
    update((current) => ({
      ...current,
      professionId: chosenId,
      locked: true,
    }))
    setLockOpen(false)
  }

  function resetGame() {
    clearPlayer()
    setChosenId(null)
    setResetOpen(false)
  }

  function addItem(key: LedgerKey, name: string, amount: number) {
    const item: LineItem = { id: crypto.randomUUID(), name, amount }
    update((current) => ({ ...current, [key]: [...current[key], item] }))
  }

  function removeItem(key: LedgerKey, id: string) {
    update((current) => ({
      ...current,
      [key]: current[key].filter((entry) => entry.id !== id),
    }))
  }

  const { decks } = useDecks()
  const profession = professionById(decks, state.professionId)
  const chosen = professionById(decks, chosenId)

  return (
    <div className="min-h-full">
      <SiteHeader
        eyebrow="Player"
        action={
          state.locked ? (
            <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
              <AlertDialogTrigger
                render={<Button variant="outline" size="sm" type="button" />}
              >
                Reset game
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset this game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The profession unlocks and the sheet on this phone is
                    cleared.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction type="button" onClick={resetGame}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null
        }
      />
      <main className={pageShell}>
        {state.locked && profession ? (
          <LockedSheet
            professionTitle={profession.title}
            fields={profession.fields}
            state={state}
            onSavings={(savings) =>
              update((current) => ({ ...current, savings }))
            }
            onCashflow={(cashflow) =>
              update((current) => ({ ...current, cashflow }))
            }
            onAdd={addItem}
            onRemove={removeItem}
            onTotal={(key, value) =>
              update((current) => ({
                ...current,
                totals: { ...current.totals, [key]: value },
              }))
            }
          />
        ) : (
          <ProfessionPicker
            chosenId={chosenId}
            chosenTitle={chosen?.title ?? "this profession"}
            lockOpen={lockOpen}
            onOpenChange={setLockOpen}
            onChoose={setChosenId}
            onLock={lockProfession}
            professions={decks.profession}
          />
        )}
      </main>
    </div>
  )
}

function ProfessionPicker({
  chosenId,
  chosenTitle,
  lockOpen,
  onOpenChange,
  onChoose,
  onLock,
  professions,
}: {
  chosenId: string | null
  chosenTitle: string
  lockOpen: boolean
  onOpenChange: (open: boolean) => void
  onChoose: (id: string) => void
  onLock: () => void
  professions: { id: string; title: string }[]
}) {
  return (
    <section className="flex flex-col gap-4 sm:gap-5 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Your profession
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Pick the profession the dealer drew, then lock it. The numbers stay
          on the card. You copy them onto your sheet yourself.
        </p>
      </div>
      <RadioGroup
        value={chosenId ?? ""}
        onValueChange={(value) => onChoose(value)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-5"
      >
        {professions.map((card) => {
          const selected = chosenId === card.id
          return (
            <Label key={card.id} htmlFor={card.id} className="h-full">
              <Card
                className={`h-full w-full cursor-pointer ${selected ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">
                    {card.title}
                  </CardTitle>
                  <CardAction>
                    <RadioGroupItem value={card.id} id={card.id} />
                  </CardAction>
                </CardHeader>
              </Card>
            </Label>
          )
        })}
      </RadioGroup>
      <AlertDialog open={lockOpen} onOpenChange={onOpenChange}>
        <Button
          type="button"
          size="lg"
          className="h-auto w-full sm:w-auto sm:min-w-48 md:w-full lg:w-auto"
          disabled={!chosenId}
          onClick={() => onOpenChange(true)}
        >
          Lock profession
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock {chosenTitle}?</AlertDialogTitle>
            <AlertDialogDescription>
              You can change it only by resetting the game.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={onLock}>
              Lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

function LockedSheet({
  professionTitle,
  fields,
  state,
  onSavings,
  onCashflow,
  onAdd,
  onRemove,
  onTotal,
}: {
  professionTitle: string
  fields: { label: string; value: string }[]
  state: PlayerState
  onSavings: (value: string) => void
  onCashflow: (value: string) => void
  onAdd: (key: LedgerKey, name: string, amount: number) => void
  onRemove: (key: LedgerKey, id: string) => void
  onTotal: (key: LedgerKey, value: string) => void
}) {
  const filled = fields.filter((field) => field.value.trim() !== "")

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-8 2xl:grid-cols-[24rem_minmax(0,1fr)] 2xl:gap-10">
      <aside className="flex flex-col gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            Locked profession
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {professionTitle}
          </h1>
        </div>
        <Collapsible>
          <Card>
            <CardHeader>
              <CollapsibleTrigger
                render={<Button variant="outline" type="button" className="w-full sm:w-auto" />}
              >
                Profession card
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <Table>
                  <TableBody>
                    {filled.map((field) => (
                      <TableRow key={field.label}>
                        <TableCell className="whitespace-normal text-muted-foreground">
                          {field.label}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-normal">
                          {field.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <TotalField
            id="savings"
            label="Savings / bank balance"
            value={state.savings}
            onChange={onSavings}
          />
          <TotalField
            id="cashflow"
            label="Net cash flow"
            value={state.cashflow}
            onChange={onCashflow}
          />
        </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
          Type every total yourself. Adding or removing a row leaves the
          figures you entered as they are.
        </p>
      </aside>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:gap-5 2xl:gap-6">
        {ledgers.map((ledger) => (
          <Ledger
            key={ledger.key}
            title={ledger.title}
            hint={ledger.hint}
            items={state[ledger.key]}
            total={state.totals[ledger.key]}
            onTotal={(value) => onTotal(ledger.key, value)}
            onAdd={(name, amount) => onAdd(ledger.key, name, amount)}
            onRemove={(id) => onRemove(ledger.key, id)}
          />
        ))}
      </div>
    </div>
  )
}

function TotalField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter your figure"
          className="h-auto py-2 text-xl sm:text-2xl md:text-3xl"
        />
      </CardHeader>
    </Card>
  )
}

function Ledger({
  title,
  hint,
  items,
  total,
  onTotal,
  onAdd,
  onRemove,
}: {
  title: string
  hint: string
  items: LineItem[]
  total: string
  onTotal: (value: string) => void
  onAdd: (name: string, amount: number) => void
  onRemove: (id: string) => void
}) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = parseAmount(amount)
    if (!name.trim() || parsed === null) {
      setError("Enter a name and a number.")
      return
    }
    onAdd(name.trim(), parsed)
    setName("")
    setAmount("")
    setError("")
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl">{title}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <form onSubmit={submit} className="flex min-w-0 flex-col gap-2">
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="min-w-0">
              <Label htmlFor={`${title}-name`} className="sr-only">
                {title} name
              </Label>
              <Input
                id={`${title}-name`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                className="w-full min-w-0"
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor={`${title}-amount`} className="sr-only">
                {title} amount
              </Label>
              <Input
                id={`${title}-amount`}
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount"
                className="w-full min-w-0"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add
          </Button>
        </form>
        {error ? (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Nothing here yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-normal">{item.name}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAmount(item.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemove(item.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right">
                <Label htmlFor={`${title}-total`} className="sr-only">
                  {title} total
                </Label>
                <Input
                  id={`${title}-total`}
                  inputMode="decimal"
                  value={total}
                  onChange={(event) => onTotal(event.target.value)}
                  placeholder="Your total"
                  className="w-full min-w-0 text-right"
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
