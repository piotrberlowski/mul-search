import { ConstrainedList as ConstrainedMulList } from "@/api/shareApi";
import { Format, Prisma } from "@/generated/prisma/client";
import prisma from "../lib/prisma";

type SeedList = ConstrainedMulList & { era: string, faction: string }

async function idNamed(kind: "era" | "faction", name: string) {
    const row = kind === "era"
        ? await prisma.era.findFirst({ where: { name }, select: { id: true } })
        : await prisma.faction.findFirst({ where: { name }, select: { id: true } })
    if (!row) throw new Error(`No ${kind} named ${name}`)
    return row.id
}

function formatUpsert(name: string, description: string) {
    return prisma.format.upsert({
        where: { name: name },
        update: {},
        create: {
            name: name,
            description: description,
        },
    })
}


async function listUpsert(key: string, description: string, format: Format, list: SeedList) {
    const [eraId, factionId] = await Promise.all([
        idNamed("era", list.era),
        idNamed("faction", list.faction),
    ])
    const constraints = `[${list.faction} during ${list.era}]`
    const context = {
        era: { connect: { id: eraId } },
        faction: { connect: { id: factionId } },
    }
    return prisma.list.upsert({
        where: { key: key },
        update: {
            ...context,
            constraints,
        },
        create: {
            key: key,
            name: list.name,
            description: description,
            format: {
                connect: format
            },
            total: list.total,
            content: list.units as Prisma.JsonArray,
            constraints,
            ...context,
        }
    })
}

async function seed() {
    const AS350 = await formatUpsert("AS350", "WolfNet (wolfsdragoons.com) Alpha Strike 350 Tournament format.")
    const Box250 = await formatUpsert("Box250", "250PV lists that can be built from various Catalyst product boxes and sets.")
    const PV250 = await formatUpsert("250PV", "Example 250PV lists that include various 'more advanced' units.")
    const response = await Promise.all([
        listUpsert(
            "350-wd-jihad",
            "Tournament-tested Wolf's Dragoons list from Jihad era - the only time they could field a Xanthos XNT-5O",
            AS350,
            { "era": "Jihad", "faction": "Wolf's Dragoons", "constraints": "[Wolf's Dragoons during Jihad]", "name": "Aprilis Prime - Wicklow 350", "total": 350, "units": [{ "id": "6MSGRC58S8", "skill": 3, "name": "Xanthos XNT-5O", "lance": "04", "ordinal": 0 }, { "id": "82MNXD7JEH", "skill": 3, "name": "Masakari (Warhawk) B", "lance": "04", "ordinal": 1 }, { "id": "SXF7TXE3ZW", "skill": 2, "name": "Partisan Air Defense Tank (LRM)", "lance": "04", "ordinal": 2 }, { "id": "FVT4CFBV93", "skill": 3, "name": "Uller (Kit Fox) D", "lance": "04", "ordinal": 3 }, { "id": "3E5NPX7BE5", "skill": 4, "name": "Dasher (Fire Moth) H", "lance": "04", "ordinal": 4 }, { "id": "FEV510NVED", "skill": 4, "name": "Maxim (I) Heavy Hover Transport", "lance": "15", "ordinal": 5 }, { "id": "NETXAE1JK4", "skill": 4, "name": "Heavy Infantry  ", "lance": "15", "ordinal": 6 }, { "id": "Z4BCJNVC15", "skill": 4, "name": "Dragoon Battle Armor (Advanced) (Sqd5)", "lance": "15", "ordinal": 7 }, { "id": "Z4BCJNVC15", "skill": 4, "name": "Dragoon Battle Armor (Advanced) (Sqd5)", "lance": "15", "ordinal": 8 }, { "id": "DGHR9GA7S1", "skill": 5, "name": "Heavy Hover APC  ", "lance": "15", "ordinal": 9 }, { "id": "6NZA9H25RA", "skill": 5, "name": "Skimmer   ", "lance": "19", "ordinal": 10 }, { "id": "ZZ6JD71AQT", "skill": 6, "name": "Recon Infantry  ", "lance": "19", "ordinal": 11 }] },
        ),
        listUpsert(
            "350-bears-da",
            "Example Rasalhague Dominion C3 list from the Dark Age, behold the ECM goodness",
            AS350,
            {"era":"Dark Age","faction":"Rasalhague Dominion","constraints":"[Rasalhague Dominion during Dark Age]","name":"Rasalhague C3","total":350,"units":[{"id": "3JTZMDETGG","skill":3,"name":"Black Hawk-KU BHKU-OR","lance":"","ordinal":0},{"id": "Y8EVWTDQ3E","skill":4,"name":"Marauder IIC 2","lance":"","ordinal":1},{"id": "Y7A6X7Y1T2","skill":3,"name":"Schiltron Mobile Fire-Support Platform B","lance":"05","ordinal":2},{"id": "R90DTN5GCZ","skill":4,"name":"Eldingar Hover Sled  ","lance":"05","ordinal":3},{"id": "JEG1Y4T36G","skill":4,"name":"Beowulf BEO-14","lance":"05","ordinal":4},{"id": "7H3E26VQ76","skill":4,"name":"Dasher (Fire Moth) R","lance":"05","ordinal":5},{"id": "J64D19T5N1","skill":4,"name":"Rogue Bear Heavy Battle Armor (Sqd5)","lance":"05","ordinal":6},{"id": "Z4C20JQ1EF","skill":3,"name":"Surat (Gray Death) Solahma Suit (Sqd5)","lance":"05","ordinal":7},{"id": "4H48G219CB","skill":6,"name":"Anhur Transport (BA)","lance":"05","ordinal":8},{"id": "96NGJGY218","skill":4,"name":"Kobold Battle Armor [SL/Flamer] (Sqd5)","lance":"05","ordinal":9},{"id": "96NGJGY218","skill":4,"name":"Kobold Battle Armor [SL/Flamer] (Sqd5)","lance":"05","ordinal":10},{"id": "002JQKJ7MB","skill":5,"name":"J-27 Ordnance Transport  ","lance":"19","ordinal":11}]},
        ),
        listUpsert(
            "250-asbox-fedsun",
            "Federated Suns list from Alpha Strike Beginner Box (alongside the Escorpion Imperio list)",
            Box250,
            { "era": "Dark Age", "faction": "Federated Suns", "constraints": "[Federated Suns during Dark Age]", "name": "[250 demo][AS box] Federated Suns", "total": 250, "units": [{ "id": "9T7CTA4HVC", "skill": 3, "name": "Atlas C 2", "lance": "", "ordinal": 0 }, { "id": "JH02XYFRA3", "skill": 3, "name": "Archer ARC-4M2", "lance": "", "ordinal": 1 }, { "id": "2DCSHB9E9G", "skill": 3, "name": "Warhammer WHM-9D", "lance": "", "ordinal": 2 }, { "id": "ACHPMDT2WV", "skill": 4, "name": "Phoenix Hawk PXH-3PL", "lance": "", "ordinal": 3 }, { "id": "7R2XVW75G5", "skill": 4, "name": "Locust LCT-5M", "lance": "", "ordinal": 4 }, { "id": "10GMT16GQN", "skill": 4, "name": "Wasp WSP-5A", "lance": "", "ordinal": 5 }] },
        ),
        listUpsert(
            "250-asbox-scorpio",
            "Escorpion Imperio list from Alpha Strike Beginner Box (can be made in parallel to the FedSun list)",
            Box250,
            { "era": "Late Republic", "faction": "Escorpión Imperio", "constraints": "[Escorpión Imperio during Late Republic]", "name": "[250 demo][AS box] Escorpion Imperio", "total": 250, "units": [{ "id": "A9C8MFB5BG", "skill": 3, "name": "Masakari (Warhawk) D", "lance": "", "ordinal": 0 }, { "id": "GTXJDQ69V4", "skill": 3, "name": "Mad Cat (Timber Wolf) M", "lance": "", "ordinal": 1 }, { "id": "CCQ936670M", "skill": 3, "name": "Pouncer Prime", "lance": "", "ordinal": 2 }, { "id": "KAH8DRPPYD", "skill": 4, "name": "Black Hawk (Nova) A", "lance": "", "ordinal": 3 }, { "id": "F8AF0YDM76", "skill": 4, "name": "Dasher (Fire Moth) K", "lance": "", "ordinal": 4 }, { "id": "JWYST148X8", "skill": 4, "name": "Blackjack BJ-1", "lance": "", "ordinal": 5 }] },
        ),
        listUpsert(
            "250-asbox-kurita",
            "Draconis Combine list from Alpha Strike Beginner Box (play vs. Wolf-in-Exile)",
            Box250,
            {"era":"Jihad","faction":"Draconis Combine","constraints":"[Draconis Combine during Jihad]","name":"[250 demo][AS Box] Draconis Combine","total":250,"units":[{"id": "GQ3HW264MT","skill":3,"name":"Archer ARC-4M","lance":"","ordinal":0},{"id": "E33DA01EMQ","skill":3,"name":"Black Hawk (Nova) Prime","lance":"","ordinal":1},{"id": "A0ZXYYQ2RH","skill":3,"name":"Wraith TR1","lance":"","ordinal":2},{"id": "D1YSJ6F1GJ","skill":3,"name":"Phoenix Hawk PXH-3K","lance":"","ordinal":3},{"id": "MG6S4M9MS0","skill":3,"name":"Blackjack BJ2-OF","lance":"","ordinal":4},{"id": "7R2XVW75G5","skill":4,"name":"Locust LCT-5M","lance":"","ordinal":5}]},
        ),
        listUpsert(
            "250-asbox-woie",
            "Clan Wolf-in-Exile list from Alpha Strike Beginner Box (play vs. Draconis Combine)",
            Box250,
            {"era":"Jihad","faction":"Clan Wolf (in Exile)","constraints":"[Clan Wolf (in Exile) during Jihad]","name":"[250 demo][AS box] Wolf-in-Exile","total":250,"units":[{"id": "7K4P6CMYGF","skill":3,"name":"Atlas C","lance":"","ordinal":0},{"id": "K1H27SQYQM","skill":3,"name":"Masakari (Warhawk) F","lance":"","ordinal":1},{"id": "56BWDT6JFS","skill":4,"name":"Mad Cat (Timber Wolf) TC","lance":"","ordinal":2},{"id": "6NQP2ZNWRQ","skill":3,"name":"Pouncer B","lance":"","ordinal":3},{"id": "F8AF0YDM76","skill":4,"name":"Dasher (Fire Moth) K","lance":"","ordinal":4}]}
        ),
    ])
    console.log(response)
}

seed()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (err) => {
        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    })