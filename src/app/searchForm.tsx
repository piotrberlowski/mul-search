import { Faction } from "./data";
import EraDropdown from "./eraDropdown";
import { FactionDropdown } from "./factionDropdown";
import TypeDropdown from "./typeDropdown";

export default function SearchForm({factions}: {factions:Faction[]}) {
    return (
        <form className="grid grid-rows-1 grid-cols-10 my-1 border border-solid border-gray-800 dark:border-gray-300 p-1 items-center" method='GET'>
            <div className="col-span-9">
                <FactionDropdown factions={factions}/>
                <div className="grid grid-cols-2">
                    <EraDropdown/>
                    <TypeDropdown/>
                </div>
            </div>
            <div className="w-100 border border-solid border-black dark:border-white text-center">
                <input type="submit" value="Search"/>
            </div>
        </form>
    )
}