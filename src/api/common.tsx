import React, { ReactNode, useImperativeHandle, useRef } from "react";

export type IModal = {
    showModal: () => void;
};

export function makeHandle(inputRef: React.RefObject<HTMLDialogElement>) {
    const handle = {
        showModal: () => {
            if (inputRef?.current) {
                inputRef.current.showModal();
            }
        }
    };
    return () => handle;
}
