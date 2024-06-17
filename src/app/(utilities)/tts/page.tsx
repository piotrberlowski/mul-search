import { Suspense } from "react";
import { TTSText } from "./tts";

export default function TTS() {

    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<div>Loading...</div>}>
                <TTSText/>
            </Suspense>
        </main>
    )
}
