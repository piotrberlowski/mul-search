import prisma from "@/../lib/prisma"
import ShortLink from "../share/shortLink"
import { Format, List } from "@prisma/client"
import { ArrowRightCircleIcon } from "@heroicons/react/16/solid"


function ListCard({ list }: { list: List }) {
    return (
        <div className="text-start items-start">
            <ShortLink className="ml-5 mt-1" listKey={list.key}>
                <div className="flex">
                    <ArrowRightCircleIcon className="h-5 w-5 mr-2 flex-none" />
                    <div className="flex-1">&quot;{list.name}&quot;: {list.description}</div>
                </div>
            </ShortLink>
        </div>
    )
}

function FormatCard({ format, className, idx }: { format: Format & { lists: List[] }, className?: string, idx: number }) {
    return (
        <div className={`collapse bg-base-300 collapse-arrow ${className}`}>
            <input type="radio" name="formats-accordion" defaultChecked={idx == 0} />
            <div className="collapse-title text-md font-medium">
                {format.name}: {format.description}
            </div>
            <div className="collapse-content text-sm">
                <div>
                    {format.lists.map((l) => (<ListCard key={l.id} list={l} />))}
                </div>
            </div>
        </div>
    )
}

export default async function Library() {

    console.log(process.env.DB_URL)

    const formats = await prisma.format.findMany({
        include: {
            lists: true,
        },
    })

    return (
        <main className="items-center text-center align-top bg-inherit">
            <div className="w-full my-5 text-lg lg:text-xl">
                Library of example Alpha Strike lists by format.
            </div>
            <div className="join join-vertical w-full max-w-screen-xl mt-2 text-start">
                {
                    formats.map((f, idx) => (<FormatCard key={f.id} format={f} className="join-item border border-base-100" idx={idx} />))
                }
            </div>
        </main>
    )
}
