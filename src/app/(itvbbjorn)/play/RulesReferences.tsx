import { type } from "os";
import { RulesReference } from "../models/RulesReference";

const RulesReferences: RulesReference[] = [
    {
        name: 'Advanced Fire Control',
        type: 'Standard',
        abbreviation: 'AFC',
        rule: 'IndustrialMechs and support vehicles equipped with Advanced Fire Control do not suffer Target Number modifiers for their unit type.',
        pageNumber: 76
    },
    {
        name: 'Amphibious',
        type: 'Standard',
        abbreviation: 'AMP',
        rule: 'This ability makes a non-naval unit capable of water movement. Amphibious units pay a total of 4” per inch of water traversed and move as a surface naval unit in water, except that they freely move in and out of water areas.',
        pageNumber: 76
    },
    {
        name: 'Angel ECM',
        type: 'Standard',
        abbreviation: 'AECM',
        rule: 'An Angel ECM suite has the effects of standard ECM (see p. 77), but is treated as two standard ECM suites if using the ECM/ECCM optional rule (see p. 161).',
        pageNumber: 76
    },
    {
        name: 'Anti-\'Mech',
        type: 'Standard',
        abbreviation: 'AM',
        rule: 'Infantry units with the Anti-’Mech (AM) special ability can make a special attack against any ground units, landed VTOLs and WiGEs, or grounded aerospace units with which they are in base-to-base contact. Anti-’Mech Infantry attacks are treated as a physical attack (see p. 45).',
        pageNumber: 76
    },
    {
        name: 'Anti-Missile System',
        type: 'Standard',
        abbreviation: 'AMS',
        rule: 'A unit with an AMS reduces the damage by 1 point (to a minimum of 1) from any of the following attacks: standard weapon attack from a unit with the IF, SRM, or LRM special abilities, Indirect Fire attack using the IF special ability, or special weapon attack made using the SRM or LRM special abilities. AMS only works on attacks coming in the front arc, unless mounted in a turret (TUR).',
        pageNumber: 76
    },
    {
        name: 'Armored Components',
        type: 'Standard',
        abbreviation: 'ARM',
        rule: 'A unit with this ability ignores the first critical hit chance rolled against it during a single Alpha Strike scenario. The first time circumstances arise that would normally generate an opportunity for a critical hit (such as structure damage), the unit’s controlling player must strike off this ability as “spent” for the remainder of the scenario, and the attacker loses his first opportunity to roll for a critical hit.',
        pageNumber: 76
    },
    {
        name: 'Armored Motive Systems',
        type: 'Standard',
        abbreviation: 'ARS',
        rule: 'A unit with this special ability applies a –1 modifier on the Determining Motive Systems Damage roll (see Motive Systems Damage Table, p. 50).',
        pageNumber: 77
    },
    {
        name: 'Barrier Armor Rating',
        type: 'Standard',
        abbreviation: 'BAR',
        rule: 'The BAR special indicates a unit that is protected by substandard armor (or commercial-grade armor). Successful attacks against such units always trigger a roll for critical hits, regardless of whether or not the structure is damaged.',
        pageNumber: 77
    },
    {
        name: 'Basic Fire Control',
        type: 'Standard',
        abbreviation: 'BFC',
        rule: 'A support vehicle or IndustrialMech with this ability has an inferior targeting and tracking system, which adds a Target Number modifier of +1 for its attack. (This modifier is listed in the Attack Modifiers Table, see p. 44.)',
        pageNumber: 77
    },
    {
        name: 'Battlemech HarJel',
        type: 'Standard',
        abbreviation: 'BHJ',
        rule: 'A ’Mech protected by HarJel ignores the additional “hull breach” critical hit checks required for being attacked while underwater or in a vacuum. All other causes for critical hit rolls still apply as normal.',
        pageNumber: 77
    },
    {
        name: 'Battlemech Shield',
        type: 'Standard',
        abbreviation: 'SHLD',
        rule: 'Shield-bearing ’Mechs gain some protection against weapon and physical attacks at the expense of their own attack accuracy. To reflect this, shield-equipped units reduce the damage from most weapons and physical attacks by 1 point (to a minimum of 0). Indirect attacks, heat-causing attacks, and area-effect attacks (such as artillery and bombs) are not dampened by the shield and thus deliver full damage. All weapon attacks made by a ’Mech with this ability incur an additional +1 Target Number modifier.', 
        pageNumber: 77
    },
    {
        name: 'Bomb',
        type: 'Standard',
        abbreviation: 'BOMB#',
        rule: 'Conventional and aerospace fighters, fixed-wing support vehicles, and some battle armor can carry bombs. The number of bombs these units can carry are equal to the number in the ability’s notation (so a unit with BOMB4 carries up to 4 bombs). For most units, these bombs may be of any type, though battle armor units with this ability may only use cluster bombs (see p. 183). (As a special exception, Arrow IV missiles of all types may be carried as bombs, but a unit that uses Arrow IV bombs must count the first Arrow IV missile carried this way as 2 bombs. All remaining bombs are then counted normally.) Each bomb a unit carries reduces its Thrust value by 1. (Battle armor units with bombs suffer no effects on their Move ratings.) A bomb-carrying unit’s card should list how many bombs the unit is carrying in the scenario, which must be equal to or less than the number this ability enables it to carry.',
        pageNumber: 77
    },
    {
        name: 'Cargo',
        type: 'Standard',
        abbreviation: 'CAR#',
        rule: 'An infantry unit with the Cargo special ability can be carried by a unit with infantry transport space (noted by the IT# special ability). For these units, the number in the ability notation indicates the amount of cargo space it needs to be transported. For example, a squad of Elemental battle armor has a CAR5 special ability, and so would need a unit with IT5 (or higher) to transport it.', pageNumber: 77
    },
    {
        name: 'CASE',
        type: 'Standard',
        abbreviation: 'CASE',
        rule: 'Units with this ability can minimize the catastrophic effects of an ammunition explosion and thus can survive Ammo Hit critical hits (see Ammo Hit, p. 50), but will suffer additional damage.',
        pageNumber: 77
    },
    {
        name: 'CASE II',
        type: 'Standard',
        abbreviation: 'CASEII',
        rule: 'Units with this ability have superior protection against ammunition explosions and can ignore Ammo Hit critical hits (see Ammo Hit, p. 50).', 
        pageNumber: 77
    },
    {
        name: 'Electronic Countermeasures',
        type: 'Standard',
        abbreviation: 'ECM',
        rule: 'See page 77. Effects Active Probes, Drones, Narc and iNarc systems (p. 136) and C3 networks (p.80) in a 12" radius',
        pageNumber: 77
    },
    {
        name: 'Elementary Engine',
        type: 'Standard',
        abbreviation: 'EE',
        rule: 'Units with EE or FC specials use non-fusion engines for power and must have the SEAL special to operate underwater. Units with elementary engines (EE) may not operate in a vacuum, but units that have both fuel cell engines (FC) and the SEAL special may operate normally in a vacuum.<br> Heat-tracking units that use either of these engine types will suffer no heat buildup from an Engine Hit critical effect. Instead, for every turn after receiving an Engine Hit critical, if the unit makes a weapon attack, its controlling player must roll 2D6 in the End Phase of that game turn. On a roll of 12, the unit explodes and is destroyed.', 
        pageNumber: 77
    },
    {
        name: 'Fuel Cell Engine',
        type: 'Standard',
        abbreviation: 'FC',
        rule: 'Units with EE or FC specials use non-fusion engines for power and must have the SEAL special to operate underwater. Units with elementary engines (EE) may not operate in a vacuum, but units that have both fuel cell engines (FC) and the SEAL special may operate normally in a vacuum. Heat-tracking units that use either of these engine types will suffer no heat buildup from an Engine Hit critical effect. Instead, for every turn after receiving an Engine Hit critical, if the unit makes a weapon attack, its controlling player must roll 2D6 in the End Phase of that game turn. On a roll of 12, the unit explodes and is destroyed.',
        pageNumber: 77
    },
    {
        name: 'Energy',
        type: 'Standard',
        abbreviation: 'ENE',
        rule: 'A unit with this ability has little to no ammo to explode, and ignores Ammo Hit critical hits (see Ammo Hit, p. 50).',
        pageNumber: 77
    },
    {
        name: 'Extended Mechanized',
        type: 'Standard',
        abbreviation: 'XMEC',
        rule: 'Battle armor with this special ability may function as mechanized battle armor, and can ride on any type of ground unit (see Transporting Infantry, p. 38).',
        pageNumber: 78
    },
    {
        name: 'Fire Resistant',
        type: 'Standard',
        abbreviation: 'FR',
        rule: 'Units with this ability are not affected by infernos or other weapons that generate heat (HT#/#/#). If the heat-causing weapon deals damage in addition to causing heat, that damage still applies.',
        pageNumber: 78
    },
    {
        name: 'Flak',
        type: 'Standard',
        abbreviation: 'FLK#/#/#',
        rule: 'If a unit with this ability misses its Attack Roll by 2 points or less when attacking an airborne aerospace unit, VTOL, or WiGE target, the unit will deal damage to its target equal to its FLK rating at the appropriate range bracket.',
        pageNumber: 78
    },
    {
        name: 'Heat',
        type: 'Standard',
        abbreviation: 'HT#/#/#',
        rule: 'Units with this ability apply heat to the target’s Heat scale during the End Phase of the turn in which they deliver a successful weapon attack. If the target is a unit type that does not use a Heat Scale, the heat this ability would normally produce is added to the normal attack damage instead (see Applying Damage, p. 49). A unit with a Heat value at a range it does not normally deal damage at may make a special weapon attack in place of its standard weapon attack. This only deals the effects of the Heat special ability.',
        pageNumber: 78
    },
    {
        name: 'Indirect Fire',
        type: 'Standard',
        abbreviation: 'IF#',
        rule: 'The Indirect Fire special ability allows a unit to attack a target without having a valid LOS to it via arcing missiles over the intervening obstacles, similar to how mortars and artillery work. This attack requires a friendly unit with a valid LOS to act as a spotter. The numerical rating for this ability indicates the amount of damage a successful indirect attack will deliver. Because they attack when other weapons cannot, damage from an indirect attack applies in place of the unit’s normal weapon attack (see Indirect Fire, p. 41). Units with the IF# and LRM #/#/# specials may make use of all alternate munitions (see p. 143) and Special Pilot Abilities (see pp. 92-101) available to the LRM#/#/# special when making indirect fire attacks, but are limited to using the LRM special ability’s long range value if it is lower than the IF special ability value.',
        pageNumber: 78
    },
    {
        name: 'Industrial Triple-Strength Myomers',
        type: 'Standard',
        abbreviation: 'I-TSM',
        rule: '’Mechs with Industrial TSM have enhanced musculature that delivers 1 point of additional damage on a successful standard- or melee-type physical attack, but these units also suffer a +2 Target Number modifier for all physical attacks due to the loss of fine motor control. (Industrial TSM also provides a movement boost, but this is already calculated in the unit’s Alpha Strike stats.)',
        pageNumber: 78
    },
    {
        name: 'Infantry Transport',
        type: 'Standard',
        abbreviation: 'IT#',
        rule: 'The numerical rating associated with this special ability indicates the amount of infantry transport space available. The unit may carry any number of infantry or battle armor units as long as these units’ total cargo requirement does not exceed the transporting unit’s infantry transport rating. Infantry Transport can be reduced and the same amount of Cargo Transport, Tons (CT#, see p. 84) added to a unit prior to the start of a game.',
        pageNumber: 78
    },
    {
        name: 'Jump Jets, Weak',
        type: 'Standard',
        abbreviation: 'JMPW#',
        rule: 'Note: The app does not consider this rule when calculating move or TMM. This unit has particularly underpowered, weak jump jets or overpowered, strong jump jets compared to their non-jump movement. Weak Jump Jets subtract the # from their TMM when using Jumping movement. Strong Jump Jets add the # to their TMM when using Jumping movement.',
        pageNumber: 78
    },
    {
        name: 'Jump Jets, Strong',
        type: 'Standard',
        abbreviation: 'JMPS#',
        rule: 'Note: The app does not consider this rule when calculating move or TMM.This unit has particularly underpowered, weak jump jets or overpowered, strong jump jets compared to their non-jump movement. Weak Jump Jets subtract the # from their TMM when using Jumping movement. Strong Jump Jets add the # to their TMM when using Jumping movement.',
        pageNumber: 78
    },
    {
        name: 'Light ECM',
        type: 'Standard',
        abbreviation: 'LECM',
        rule: 'Light ECM functions identically to ECM (see p. 77), but with a reduced radius. Light ECM only creates an ECM bubble with a 2” radius.',
        pageNumber: 78
    },
    {
        name: 'Mechanized',
        type: 'Standard',
        abbreviation: 'MEC',
        rule: 'Battle armor with this special ability may function as mechanized battle armor, and can ride on any ground unit type that has the Omni special ability (see Transporting Infantry, p. 38).',
        pageNumber: 78
    },
    {
        name: 'Melee',
        type: 'Standard',
        abbreviation: 'MEL',
        rule: 'This special ability indicates that the ’Mech is equipped with a physical attack weapon, and adds 1 additional point of physical attack damage on a successful Melee-type physical attack (see Resolving Physical Attacks, p. 45).',
        pageNumber: 78
    },
    {
        name: 'Mimetic Armor System',
        type: 'Standard',
        abbreviation: 'MAS',
        rule: 'Mimetic armors are similar to Stealth systems (see p. 79) in that they make a target more difficult to hit with weapon attacks (but not physical attacks). Unlike Stealth, to be effective mimetic armor requires its bearer to remain stationary. If a unit with the MAS special ability is immobile or remained at a standstill during the this turn’s Movement Phase, all non-physical attacks against that unit receive a +3 Target Number modifier for the remainder of the turn. LMAS functions the same way, but provides only a +2 modifier.',
        pageNumber: 78
    },
    {
        name: 'Light Mimetic Armor System',
        type: 'Standard',
        abbreviation: 'LMAS',
        rule: 'Mimetic armors are similar to Stealth systems (see p. 79) in that they make a target more difficult to hit with weapon attacks (but not physical attacks). Unlike Stealth, to be effective mimetic armor requires its bearer to remain stationary. If a unit with the MAS special ability is immobile or remained at a standstill during the this turn’s Movement Phase, all non-physical attacks against that unit receive a +3 Target Number modifier for the remainder of the turn. LMAS functions the same way, but provides only a +2 modifier.',
        pageNumber: 78
    },
    {
        name: 'Off-Road',
        type: 'Standard',
        abbreviation: 'ORO',
        rule: 'Lacking the rugged suspension of combat vehicles, ground-based support vehicles that use the wheeled (w) movement type must pay 2 inches of additional Move for every non-paved inch they move unless they possess the Off-Road special. This ability is not required for any other unit types, including support vehicles, that use movement modes other than wheeled.',
        pageNumber: 78
    },
    {
        name: 'Omni',
        type: 'Standard',
        abbreviation: 'OMNI',
        rule: 'Ground-based Omni units (’Mechs or vehicles) may transport a single battle armor unit using the mechanized battle armor rules (see Transporting Infantry, p. 38).',
        pageNumber: 78
    },
    {
        name: 'Overheat Long',
        type: 'Standard',
        abbreviation: 'OVL',
        rule: 'A unit with this special ability may overheat up to its OV value and apply that value to its Long range damage value as well as the unit’s Short and Medium range damage values. (A unit without this special ability may only apply the damage benefits of its Overheat capabilities to damage delivered in the Short and Medium range brackets.)',
        pageNumber: 78
    },
    {
        name: 'Rear-Firing Weapons',
        type: 'Standard',
        abbreviation: 'RF#/#/#',
        rule: 'See p.78 May fire in the rear facing but suffers increased TN when doing so. +1 for ground units.',
        pageNumber: 78
    },
    {
        name: 'Stealth',
        type: 'Standard',
        abbreviation: 'STL',
        rule: 'See p.79Makes this unit more difficult to hit. Effected by ECM.',
        pageNumber: 79
    },
    {
        name: 'Submersible Movement Strong',
        type: 'Standard',
        abbreviation: 'SUBS#',
        rule: 'This unit has particularly underpowered, weak submersible movement or overpowered, strong submersible movement compared to their non-submersible movement. Weak submersible movement subtracts the # from their TMM when using submersible movement. Strong submersible movement adds the # to their TMM when using submersible movement.',
        pageNumber: 79
    },
    {
        name: 'Submersible Movement Weak',
        type: 'Standard',
        abbreviation: 'SUBW#',
        rule: 'This unit has particularly underpowered, weak submersible movement or overpowered, strong submersible movement compared to their non-submersible movement. Weak submersible movement subtracts the # from their TMM when using submersible movement. Strong submersible movement adds the # to their TMM when using submersible movement.',
        pageNumber: 79
    },
    {
        name: 'Torpedo',
        type: 'Standard',
        abbreviation: 'TOR#',
        rule: 'Torpedo launchers may only be launched by units in water (or on the surface of a water feature), against targets that are also on or in water (this includes units like hovercraft and airborne WiGEs operating just above the surface of water). Torpedo special ability damage is given in range brackets like a standard weapon attack, and may be fired separately or combined with the standard weapon damage that a submerged unit may deliver in combat. Torpedo attacks ignore underwater range and damage modifiers that affect other weapons. For example, if a submergedunit, with damage values of 2/2/2 and a TOR 3/3 special, fires at a target that is in its underwater Short range bracket, it will deliver 4 points of total damage on a successful attack. (The base damage of 2 for its normal weapons is halved to 1, but the full TOR damage of 3 applies without reduction.)',
        pageNumber: 79
    },
    {
        name: 'Triple-Strength Myomer',
        type: 'Standard',
        abbreviation: 'TSM',
        rule: 'See p.79. Can move faster and deliver additional physical damage when running hot.',
        pageNumber: 79
    },
    {
        name: 'Turret',
        type: 'Standard',
        abbreviation: 'TUR#',
        rule: 'A unit with a turret has some (or all) of its weapons mounted with a 360-degree field of fire. Damage for all turret-mounted weapons are included in the base damage values for the unit, and then separately for the TUR special ability. Thus, when a unit with a turret wishes to make an attack outside of its normal forward field of fire, it must use the damage values for its TUR special ability in place of the unit’s standard damage values. Attacks made using the turret cannot be combined with any special attack ability not included in the unit’s TUR special ability. Some particularly large units—such as mobile structures and very large or super large vehicles—may feature multiple turrets. A unit with multiple turrets may use each turret individually to deliver its attacks (see Exceptionally Large Units, p. 64).',
        pageNumber: 79
    },
    {
        name: 'Underwater Maneuvering Units',
        type: 'Standard',
        abbreviation: 'UMU',
        rule: 'A unit with the UMU special ability uses the submersible movement rules when it is submerged in water instead of the normal underwater movement rules (see Submersible Movement, p. 36).',
        pageNumber: 79
    },
    {
        name: 'Watchdog',
        type: 'Standard',
        abbreviation: 'WAT',
        rule: 'A unit with this special ability possesses the Watchdog Composite Electronic Warfare System. For purposes of Alpha Strike, it is treated as if it has both the Light Active Probe (LPRB; see p. 82) and ECM special abilities.',
        pageNumber: 79
    }
];

export default RulesReferences;