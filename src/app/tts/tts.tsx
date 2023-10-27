'use client'
import { useState, useEffect } from "react";
import { loadTTSString } from "../api/unitListApi";


export function TTSText() {
    const [text, setText] = useState<string>('Loading...')
    
    useEffect( () => {
        setText(loadTTSString())
    }, [])

    return (
        <div className="text-center">
            {text}
        </div>
    )
}