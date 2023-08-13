export interface Unit {
    Id: number,
    Name: string,
    BFDamageShort: number,
    BFDamageMedium: number,
    BFDamageLong: number,
    BFMove: string,
    BFPointValue: number,
    BFArmor: number,
    BFStructure: number,
    BFAbilities: string,
}

export default function UnitLine({unit}:{unit:Unit}) {
    return (
        <div className="grid grid-cols-10 my-0 border border-solid border-gray-400 dark:border-gray-800 font-small">
            <div className="col-start-1 col-span-3 text-center items-center">
                <a href={"http://www.masterunitlist.info/Unit/Details/" + unit.Id} target="_">{unit.Name}</a>
            </div>
            <div className="col-start-4">{unit.BFPointValue}</div>
            <div>{unit.BFMove}</div>
            <div>{unit.BFDamageShort}/{unit.BFDamageMedium}/{unit.BFDamageLong}</div>
            <div>{unit.BFArmor} + {unit.BFStructure}</div>
            <div className="text-xs truncate col-span-3">{unit.BFAbilities}</div>
        </div>
    )  
}