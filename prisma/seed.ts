import { ConstrainedList as ConstrainedMulList, MulUnit } from "@/api/shareApi";
import { Format, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

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


function listUpsert(key: string, description: string, format: Format, list: ConstrainedMulList) {
    return prisma.list.upsert({
        where: { key: key },
        update: {},
        create: {
            key: key,
            name: list.name,
            description: description,
            format: {
                connect: format
            },
            total: list.total,
            content: list.units as Prisma.JsonArray,
            constraints: list.constraints,
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
            { "constraints": "[Wolf's Dragoons including Blank General List during Jihad]", "name": "Aprilis Prime - Wicklow 350", "total": 350, "units": [{ "id": 3606, "skill": 3, "name": "Xanthos XNT-5O", "lance": "04", "ordinal": 0 }, { "id": 2092, "skill": 3, "name": "Masakari (Warhawk) B", "lance": "04", "ordinal": 1 }, { "id": 2437, "skill": 2, "name": "Partisan Air Defense Tank (LRM)", "lance": "04", "ordinal": 2 }, { "id": 3343, "skill": 3, "name": "Uller (Kit Fox) D", "lance": "04", "ordinal": 3 }, { "id": 844, "skill": 4, "name": "Dasher (Fire Moth) H", "lance": "04", "ordinal": 4 }, { "id": 2115, "skill": 4, "name": "Maxim (I) Heavy Hover Transport", "lance": "15", "ordinal": 5 }, { "id": 1436, "skill": 4, "name": "Heavy Infantry  ", "lance": "15", "ordinal": 6 }, { "id": 9383, "skill": 4, "name": "Dragoon Battle Armor (Advanced) (Sqd5)", "lance": "15", "ordinal": 7 }, { "id": 9383, "skill": 4, "name": "Dragoon Battle Armor (Advanced) (Sqd5)", "lance": "15", "ordinal": 8 }, { "id": 1435, "skill": 5, "name": "Heavy Hover APC  ", "lance": "15", "ordinal": 9 }, { "id": 5065, "skill": 5, "name": "Skimmer   ", "lance": "19", "ordinal": 10 }, { "id": 2673, "skill": 6, "name": "Recon Infantry  ", "lance": "19", "ordinal": 11 }] },
        ),
        listUpsert(
            "350-bears-da",
            "Example Rasalhague Dominion C3 list from the Dark Age, behold the ECM goodness",
            AS350,
            {"constraints":"[Rasalhague Dominion including IS Clan General during Dark Age]","name":"Rasalhague C3","total":350,"units":[{"id":3825,"skill":3,"name":"Black Hawk-KU BHKU-OR","lance":"","ordinal":0},{"id":2066,"skill":4,"name":"Marauder IIC 2","lance":"","ordinal":1},{"id":2816,"skill":3,"name":"Schiltron Mobile Fire-Support Platform B","lance":"05","ordinal":2},{"id":947,"skill":4,"name":"Eldingar Hover Sled  ","lance":"05","ordinal":3},{"id":328,"skill":4,"name":"Beowulf BEO-14","lance":"05","ordinal":4},{"id":7582,"skill":4,"name":"Dasher (Fire Moth) R","lance":"05","ordinal":5},{"id":8661,"skill":4,"name":"Rogue Bear Heavy Battle Armor (Sqd5)","lance":"05","ordinal":6},{"id":8822,"skill":3,"name":"Surat (Gray Death) Solahma Suit (Sqd5)","lance":"05","ordinal":7},{"id":34,"skill":6,"name":"Anhur Transport (BA)","lance":"05","ordinal":8},{"id":8642,"skill":4,"name":"Kobold Battle Armor [SL/Flamer] (Sqd5)","lance":"05","ordinal":9},{"id":8642,"skill":4,"name":"Kobold Battle Armor [SL/Flamer] (Sqd5)","lance":"05","ordinal":10},{"id":1645,"skill":5,"name":"J-27 Ordnance Transport  ","lance":"19","ordinal":11}]},
        ),
        listUpsert(
            "250-asbox-fedsun",
            "Federated Suns list from Alpha Strike Beginner Box (alongside the Escorpion Imperio list)",
            Box250,
            { "constraints": "[Federated Suns including Inner Sphere General during Dark Age]", "name": "[250 demo][AS box] Federated Suns", "total": 250, "units": [{ "id": 8431, "skill": 3, "name": "Atlas C 2", "lance": "", "ordinal": 0 }, { "id": 7730, "skill": 3, "name": "Archer ARC-4M2", "lance": "", "ordinal": 1 }, { "id": 3497, "skill": 3, "name": "Warhammer WHM-9D", "lance": "", "ordinal": 2 }, { "id": 2501, "skill": 4, "name": "Phoenix Hawk PXH-3PL", "lance": "", "ordinal": 3 }, { "id": 1908, "skill": 4, "name": "Locust LCT-5M", "lance": "", "ordinal": 4 }, { "id": 7495, "skill": 4, "name": "Wasp WSP-5A", "lance": "", "ordinal": 5 }] },
        ),
        listUpsert(
            "250-asbox-scorpio",
            "Escorpion Imperio list from Alpha Strike Beginner Box (can be made in parallel to the FedSun list)",
            Box250,
            { "constraints": "[Escorpión Imperio including Blank General List during Late Republic]", "name": "[250 demo][AS box] Escorpion Imperio", "total": 250, "units": [{ "id": 2094, "skill": 3, "name": "Masakari (Warhawk) D", "lance": "", "ordinal": 0 }, { "id": 7515, "skill": 3, "name": "Mad Cat (Timber Wolf) M", "lance": "", "ordinal": 1 }, { "id": 2563, "skill": 3, "name": "Pouncer Prime", "lance": "", "ordinal": 2 }, { "id": 335, "skill": 4, "name": "Black Hawk (Nova) A", "lance": "", "ordinal": 3 }, { "id": 845, "skill": 4, "name": "Dasher (Fire Moth) K", "lance": "", "ordinal": 4 }, { "id": 373, "skill": 4, "name": "Blackjack BJ-1", "lance": "", "ordinal": 5 }] },
        ),
        listUpsert(
            "250-asbox-kurita",
            "Draconis Combine list from Alpha Strike Beginner Box (play vs. Wolf-in-Exile)",
            Box250,
            {"constraints":"[Draconis Combine including Inner Sphere General during Jihad]","name":"[250 demo][AS Box] Draconis Combine","total":250,"units":[{"id":78,"skill":3,"name":"Archer ARC-4M","lance":"","ordinal":0},{"id":342,"skill":3,"name":"Black Hawk (Nova) Prime","lance":"","ordinal":1},{"id":3588,"skill":3,"name":"Wraith TR1","lance":"","ordinal":2},{"id":2498,"skill":3,"name":"Phoenix Hawk PXH-3K","lance":"","ordinal":3},{"id":384,"skill":3,"name":"Blackjack BJ2-OF","lance":"","ordinal":4},{"id":1908,"skill":4,"name":"Locust LCT-5M","lance":"","ordinal":5}]},
        ),
        listUpsert(
            "250-asbox-woie",
            "Clan Wolf-in-Exile list from Alpha Strike Beginner Box (play vs. Draconis Combine)",
            Box250,
            {"constraints":"[Clan Wolf (in Exile) including IS Clan General during Jihad]","name":"[250 demo][AS box] Wolf-in-Exile","total":250,"units":[{"id":3750,"skill":3,"name":"Atlas C","lance":"","ordinal":0},{"id":5491,"skill":3,"name":"Masakari (Warhawk) F","lance":"","ordinal":1},{"id":7595,"skill":4,"name":"Mad Cat (Timber Wolf) TC","lance":"","ordinal":2},{"id":2558,"skill":3,"name":"Pouncer B","lance":"","ordinal":3},{"id":845,"skill":4,"name":"Dasher (Fire Moth) K","lance":"","ordinal":4}]}
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