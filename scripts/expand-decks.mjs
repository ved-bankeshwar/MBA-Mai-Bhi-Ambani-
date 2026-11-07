import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data")
const steps = [0, 0.25, 0.375, 0.625, 0.75, 1]

function series(low, high, step) {
  return steps.map((t) => {
    const value = low + (high - low) * t
    return Math.round(value / step) * step
  })
}

function money(value) {
  return Math.round(value).toLocaleString("en-US")
}

function decimal(value) {
  const rounded = Math.round(value * 10) / 10
  const text = rounded.toFixed(1)
  return text.endsWith(".0") ? text.slice(0, -2) : text
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function band(values, format) {
  return `${format(values[1])} ~ ${format(values[4])}`
}

function load(name) {
  return JSON.parse(readFileSync(join(dataDir, name), "utf8"))
}

function save(name, cards) {
  writeFileSync(join(dataDir, name), `${JSON.stringify(cards, null, 2)}\n`)
}

function append(name, cards) {
  const current = load(name)
  const ids = new Set(current.map((card) => card.id))
  const fresh = cards.filter((card) => !ids.has(card.id))
  const next = current.concat(fresh)
  save(name, next)
  console.log(`${name}: ${current.length} -> ${next.length}`)
  return fresh
}

const professions = [
  ["Nurse", 18000, 0, 2700, 600, 0, 0, 7100, 900, 0, 0, 0, 20000, 11000],
  ["School Teacher", 22000, 1760, 3300, 0, 900, 800, 7240, 1200, 380000, 40000, 18000, 0, 14000],
  ["Chef", 20000, 0, 3000, 700, 0, 900, 7400, 1100, 350000, 0, 20000, 25000, 12000],
  ["Journalist", 24000, 1900, 3600, 500, 0, 1000, 8000, 1400, 420000, 0, 22000, 18000, 15000],
  ["Police Officer", 26000, 2100, 3900, 0, 0, 1100, 8400, 1500, 450000, 0, 25000, 0, 16000],
  ["Graphic Designer", 27000, 2160, 4000, 700, 0, 1000, 8640, 1600, 460000, 0, 22000, 28000, 16000],
  ["Pharmacist", 33000, 2640, 4900, 0, 1200, 1300, 9960, 1800, 560000, 55000, 28000, 0, 19000],
  ["Banker", 38000, 3040, 5500, 0, 1400, 1600, 11460, 2200, 640000, 60000, 35000, 0, 22000],
  ["Architect", 42000, 3360, 6100, 0, 1500, 1800, 12240, 2300, 720000, 70000, 40000, 0, 24000],
  ["Lawyer", 55000, 4400, 8000, 0, 1800, 2200, 16000, 2800, 950000, 80000, 200000, 0, 30000],
  ["Dentist", 70000, 5600, 9800, 0, 2500, 2600, 19500, 4000, 1100000, 180000, 260000, 0, 32000],
  ["Pilot", 90000, 7200, 12000, 0, 2000, 3500, 25300, 5000, 1500000, 90000, 400000, 0, 45000],
].map(
  ([
    title,
    salary,
    taxes,
    home,
    personal,
    education,
    vehicle,
    other,
    child,
    homeBalance,
    educationBalance,
    carBalance,
    personalBalance,
    savings,
  ]) => {
    const total = taxes + home + personal + education + vehicle + other
    const cashflow = salary - total
    if (cashflow <= 0) throw new Error(`${title} has no cash flow`)
    return {
      id: `prof-${slug(title)}`,
      title,
      fields: [
        ["Salary", salary],
        ["Taxes", taxes],
        ["Home loan", home],
        ["Personal loan", personal],
        ["Marriage / higher education loan", education],
        ["Vehicle loan", vehicle],
        ["Other expenses", other],
        ["Per child", child],
        ["Total expenses", total],
        ["Monthly cash flow", cashflow],
        ["Home loan balance", homeBalance],
        ["Education loan balance", educationBalance],
        ["Car loan balance", carBalance],
        ["Personal loan balance", personalBalance],
        ["Savings", savings],
      ].map(([label, value]) => ({ label, value: money(value) })),
      paragraphs: [],
    }
  },
)

const stocks = [
  ["NXP Retail", 40, 160, 0.05],
  ["QBR Cement", 70, 220, 0.045],
  ["HPL Ports", 30, 140, 0.055],
  ["MVA Metals", 18, 90, 0.04],
  ["CKT Media", 12, 75, 0.03],
  ["OWD Insurance", 90, 210, 0.06],
  ["ZNP Chemicals", 45, 150, 0.048],
  ["FRS Logistics", 22, 88, 0.035],
  ["BHL Hospitals", 55, 175, 0.025],
  ["UQE Utilities", 80, 140, 0.07],
  ["KDS Consumer", 35, 125, 0.052],
  ["WMT Realty Fund", 50, 110, 0.065],
  ["PXN Smallcap Fund", 20, 95, 0.02],
  ["YLA Balanced Fund", 40, 70, 0.08],
  ["GHT Liquid Fund", 12.5, 15.5, 0.55],
].map(([title, low, high, yieldRate]) => {
  const prices = series(low, high, 0.1)
  const dividends = prices.map((price) => Math.round(price * yieldRate * 10) / 10)
  return {
    id: `stock-${slug(title)}`,
    title,
    fields: [{ label: "Historic trading price", value: band(prices, decimal) }],
    paragraphs: [],
    rolls: prices.map((price, index) => ({
      fields: [
        { label: "Price per share", value: decimal(price) },
        { label: "Dividend", value: `${decimal(dividends[index])} per 100 shares` },
      ],
      paragraphs: [
        `Only you can buy (everyone can sell) any number of ${title} shares at ${decimal(price)} per share. Dividend income is ${decimal(dividends[index])}/100 shares.`,
      ],
    })),
  }
})

const realty = [
  ["a compact studio apartment near the station", 250000, 900000, 20, 0.0026, 0.0062],
  ["a 1BHK flat in the old city", 400000, 1400000, 20, 0.0025, 0.006],
  ["a 2BHK apartment beside the metro", 700000, 2200000, 15, 0.0025, 0.0064],
  ["a 2BHK row house in a quiet lane", 900000, 2600000, 15, 0.0024, 0.0061],
  ["a 3BHK flat facing the park", 1200000, 3600000, 10, 0.0025, 0.0067],
  ["a duplex house in the suburbs", 1500000, 4200000, 15, 0.0023, 0.006],
  ["a corner shop on the main road", 800000, 2400000, 25, 0.0028, 0.0065],
  ["a small office cabin in a business park", 600000, 1800000, 20, 0.0027, 0.0063],
  ["a farmhouse an hour from the city", 2000000, 6000000, 10, 0.0022, 0.0058],
  ["a beach cottage in a fishing village", 1100000, 3300000, 20, 0.0024, 0.0062],
  ["a warehouse shed on the highway", 1800000, 4500000, 25, 0.0021, 0.0055],
  ["a service apartment in the IT corridor", 1300000, 3400000, 15, 0.0026, 0.0064],
  ["a hostel building near the college", 2500000, 7000000, 10, 0.0023, 0.006],
  ["a townhouse in a gated layout", 1600000, 4000000, 15, 0.0024, 0.0061],
  ["a plot with a small house on the outskirts", 500000, 1600000, 30, 0.0022, 0.0056],
  ["a resort cottage on the hill", 2200000, 6400000, 20, 0.0023, 0.006],
  ["a clinic space on the ground floor", 750000, 2100000, 20, 0.0027, 0.0063],
  ["a parking complex near the market", 900000, 2700000, 25, 0.002, 0.0054],
  ["a riverside cottage with two rooms", 1400000, 3800000, 15, 0.0024, 0.0062],
].map(([title, low, high, down, rentRate, emiRate]) => {
  const prices = series(low, high, 10000)
  const rents = prices.map((price) => Math.round((price * rentRate) / 100) * 100)
  const emis = prices.map((price) => Math.round((price * emiRate) / 100) * 100)
  return {
    id: `realty-${slug(title)}`,
    title,
    fields: [
      { label: "Down payment", value: `${down}%` },
      { label: "Historic price", value: band(prices, money) },
    ],
    paragraphs: [],
    rolls: prices.map((price, index) => ({
      fields: [
        { label: "Price", value: money(price) },
        { label: "Rental income", value: money(rents[index]) },
        { label: "EMI and other expenses", value: money(emis[index]) },
      ],
      paragraphs: [
        `Only you can buy (everyone can sell) ${title} for ${money(price)} only.`,
        `Ready finance with only ${down}% down payment.`,
        `Rental income is ${money(rents[index])} and EMI and other expenses are ${money(emis[index])}.`,
      ],
    })),
    market: {
      sell: "Sell price",
      update: "Updated rental income",
      intro: "Sudden changes in the real-estate market.",
      line: (price, rent) =>
        `Everyone can sell ${title} for ${money(price)} or update rental income to ${money(rent)}.`,
      values: prices.map((price, index) => [price, rents[index]]),
    },
  }
})

const finance = [
  ["a juice stall outside the school", 10000, 40000, 100, 0.075, 0, 1000],
  ["a flower stall near the temple", 15000, 50000, 100, 0.07, 0, 1000],
  ["a photocopy shop beside the college", 40000, 120000, 50, 0.09, 0.01, 5000],
  ["a laundry shop in the lane", 50000, 150000, 50, 0.08, 0.012, 5000],
  ["a tiffin service for office staff", 30000, 90000, 100, 0.08, 0, 5000],
  ["a cycle repair shed", 8000, 25000, 100, 0.08, 0, 1000],
  ["a newspaper and magazine stand", 12000, 36000, 100, 0.07, 0, 1000],
  ["an ice-cream cart in the park", 20000, 60000, 100, 0.075, 0, 5000],
  ["a mobile repair counter", 60000, 160000, 40, 0.06, 0.012, 5000],
  ["a tailor shop in the market", 25000, 80000, 100, 0.07, 0, 5000],
  ["a barber shop on the corner", 30000, 90000, 100, 0.065, 0, 5000],
  ["a vegetable cart at the crossing", 10000, 40000, 100, 0.09, 0, 1000],
  ["a milk booth in the society", 40000, 100000, 50, 0.07, 0.008, 5000],
  ["a snack counter at the bus stand", 35000, 110000, 50, 0.085, 0.01, 5000],
  ["a courier pickup point", 50000, 140000, 40, 0.06, 0.01, 5000],
  ["an internet cafe near the hostel", 80000, 200000, 40, 0.055, 0.012, 10000],
  ["a pottery stall at the craft market", 15000, 45000, 100, 0.07, 0, 1000],
  ["a pan and cold-drink stall", 20000, 70000, 100, 0.08, 0, 5000],
  ["a two-wheeler rental desk", 100000, 250000, 30, 0.045, 0.012, 10000],
].map(([title, low, high, down, incomeRate, emiRate, step]) => {
  const costs = series(low, high, step)
  const incomes = costs.map((cost) => Math.max(100, Math.round((cost * incomeRate) / 100) * 100))
  const emis = costs.map((cost) => Math.round((cost * emiRate) / 100) * 100)
  const nets = incomes.map((income, index) => income - emis[index])
  if (nets.some((net) => net <= 0)) throw new Error(`${title} has no net income`)
  return {
    id: `finance-${slug(title)}`,
    title,
    fields: [
      { label: "Down payment", value: `${down}%` },
      { label: "Historic net income", value: band(nets, money) },
    ],
    paragraphs: [],
    rolls: costs.map((cost, index) => ({
      fields: [
        { label: "Cost", value: money(cost) },
        { label: "Your share of income", value: money(incomes[index]) },
        { label: "EMI expense", value: money(emis[index]) },
      ],
      paragraphs: [
        `Help your friend start their own business by financing ${title} costing ${money(cost)} with ${down}% down payment. Your friend promises to share income 50/50.`,
        `Your share of income will be ${money(incomes[index])} for ${money(emis[index])} EMI expense.`,
      ],
    })),
    market: {
      sell: "Sell stake for",
      update: "Updated income",
      intro: `New government rules affect small business, specifically ${title}.`,
      line: (cost, income) =>
        `Everyone may sell their stake for ${money(cost)} or update income to ${money(income)}.`,
      values: costs.map((cost, index) => [cost, incomes[index]]),
    },
  }
})

const businesses = [
  ["a neighbourhood restaurant", 1500000, 3500000, 20, 0.03, 0.01, 100000],
  ["a printing press", 800000, 2000000, 25, 0.028, 0.009, 100000],
  ["a diagnostic lab", 2000000, 5000000, 20, 0.025, 0.01, 100000],
  ["a gym in a commercial complex", 1200000, 2800000, 20, 0.032, 0.012, 100000],
  ["a coaching institute", 600000, 1600000, 30, 0.04, 0.01, 100000],
  ["a budget hotel on the highway", 8000000, 16000000, 15, 0.02, 0.012, 500000],
  ["a cold storage unit", 3000000, 7000000, 20, 0.022, 0.01, 200000],
  ["a passenger bus", 2000000, 4000000, 20, 0.035, 0.012, 100000],
  ["a fishing boat", 900000, 2100000, 25, 0.04, 0.01, 100000],
  ["a garment workshop", 1000000, 2500000, 25, 0.03, 0.01, 100000],
  ["a petrol pump on the bypass", 15000000, 30000000, 15, 0.018, 0.011, 500000],
  ["a single-screen cinema", 5000000, 12000000, 20, 0.02, 0.012, 500000],
  ["a playschool in a bungalow", 700000, 1800000, 30, 0.045, 0.01, 100000],
  ["a dental clinic you operate", 2500000, 5500000, 20, 0.028, 0.01, 100000],
  ["a logistics warehouse", 4000000, 9000000, 20, 0.02, 0.009, 200000],
  ["a dairy collection centre", 500000, 1400000, 30, 0.035, 0.008, 50000],
  ["an excavator for hire", 3500000, 7000000, 20, 0.03, 0.014, 200000],
  ["a small software studio", 400000, 1200000, 40, 0.08, 0.005, 50000],
].map(([title, low, high, down, incomeRate, emiRate, step]) => {
  const costs = series(low, high, step)
  const incomes = costs.map((cost) => Math.round((cost * incomeRate) / 100) * 100)
  const emis = costs.map((cost) => Math.round((cost * emiRate) / 100) * 100)
  const nets = incomes.map((income, index) => income - emis[index])
  if (nets.some((net) => net <= 0)) throw new Error(`${title} has no net income`)
  return {
    id: `business-${slug(title)}`,
    title,
    fields: [
      { label: "Down payment", value: `${down}%` },
      { label: "Historic net income", value: band(nets, money) },
    ],
    paragraphs: [],
    rolls: costs.map((cost, index) => ({
      fields: [
        { label: "Cost", value: money(cost) },
        { label: "Income", value: money(incomes[index]) },
        { label: "EMI expense", value: money(emis[index]) },
      ],
      paragraphs: [
        `Start your own business only if your salary income is 0, with ${title} costing ${money(cost)} and ${down}% down payment.`,
        `Your income will be ${money(incomes[index])} for ${money(emis[index])} EMI expense.`,
      ],
    })),
    market: {
      sell: "Sell price",
      update: "Updated income",
      intro: `You have been running ${title} for a while now. Sudden changes are affecting this line of business.`,
      line: (cost, income) =>
        `Everyone owning this business may sell at ${money(cost)} or update income to ${money(income)}.`,
      values: costs.map((cost, index) => [cost, incomes[index]]),
    },
  }
})

const doodads = [
  ["a pair of shoes you have wanted for months", 800, 6400, 100, "You found a pair of shoes you have wanted for months, costing"],
  ["noise-cancelling headphones on a festival sale", 1500, 12000, 100, "You found noise-cancelling headphones on a festival sale, costing"],
  ["front-row tickets for a concert tonight", 1200, 8000, 100, "Your friends already bought front-row tickets for a concert tonight, costing"],
  ["a dinner at the new restaurant in town", 600, 4200, 100, "You booked a dinner at the new restaurant in town, costing"],
  ["the latest video game and a controller", 2000, 9000, 100, "You found the latest video game and a controller, costing"],
  ["tickets for the cricket final", 500, 5000, 100, "You found tickets for the cricket final, costing"],
  ["a weekend spa package", 2500, 15000, 500, "You found a weekend spa package, costing"],
  ["a sofa that matches the living room", 4000, 28000, 500, "You found a sofa that matches the living room, costing"],
  ["a new laptop you do not need yet", 20000, 80000, 1000, "You found a new laptop you do not need yet, costing"],
  ["a wedding gift for a close friend", 1500, 12000, 100, "You are expected to bring a wedding gift for a close friend, costing"],
  ["a bicycle for the morning ride", 3000, 18000, 500, "You found a bicycle for the morning ride, costing"],
  ["a set of professional art supplies", 800, 6000, 100, "You found a set of professional art supplies, costing"],
  ["a musical keyboard from the shop window", 5000, 30000, 500, "You found a musical keyboard from the shop window, costing"],
  ["a camera drone on clearance", 8000, 40000, 1000, "You found a camera drone on clearance, costing"],
  ["a wristwatch you saw in a magazine", 2500, 20000, 500, "You found a wristwatch you saw in a magazine, costing"],
  ["a two-night hill-station getaway", 4000, 24000, 500, "You found a two-night hill-station getaway, costing"],
  ["a family day at the theme park", 1000, 7000, 100, "You found a family day at the theme park, costing"],
].map(([title, low, high, step, opening]) => {
  const costs = series(low, high, step)
  return {
    id: `doodad-${slug(title)}`,
    title,
    fields: [],
    paragraphs: [],
    rolls: costs.map((cost) => ({
      fields: [{ label: "Cost", value: money(cost) }],
      paragraphs: [
        `${opening} ${money(cost)} only.`,
        "You have to grab this opportunity even if it means taking a personal loan.",
      ],
    })),
  }
})

function marketCards(kind, cards) {
  return cards.map((card) => ({
    id: `market-${kind}-${slug(card.title)}`,
    title: card.title,
    fields: [],
    paragraphs: [],
    rolls: card.market.values.map(([left, right]) => ({
      fields: [
        { label: card.market.sell, value: kind === "stock" ? decimal(left) : money(left) },
        {
          label: card.market.update,
          value: kind === "stock" ? `${decimal(right)} per 100 shares` : money(right),
        },
      ],
      paragraphs:
        kind === "stock"
          ? [
              `Market dynamics affect ${card.title}’s share price. Everybody can sell at ${decimal(left)} per share or update their dividend income to ${decimal(right)}/100 shares.`,
              "No purchase is allowed at this time.",
            ]
          : [card.market.intro, card.market.line(left, right)],
    })),
  }))
}

const stockMarkets = stocks.map((card) => ({
  ...card,
  market: {
    sell: "Sell price per share",
    update: "Updated dividend",
    values: card.rolls.map((roll) => [
      Number(roll.fields[0].value),
      Number(roll.fields[1].value.replace(/[^0-9.]/g, "")),
    ]),
  },
}))

for (const card of [...realty, ...finance, ...businesses, ...doodads, ...stocks]) {
  if (card.rolls.length !== 6) throw new Error(`${card.title} does not have 6 rolls`)
}

append("professions.json", professions)
append("stocks.json", stocks.map(({ market, ...card }) => card))
append("realty.json", realty.map(({ market, ...card }) => card))
append("finance.json", finance.map(({ market, ...card }) => card))
append("business.json", businesses.map(({ market, ...card }) => card))
append("doodads.json", doodads)
append("market.json", [
  ...marketCards("realty", realty),
  ...marketCards("finance", finance),
  ...marketCards("business", businesses),
  ...marketCards("stock", stockMarkets),
])
