export function Container({ children }) {
    return (
        <div className="pt-6 mt-5 mb-5 rounded-xl bg-black/75 flex flex-col justify-center min-w-fit border-[3px] border-solid border-white">
            {children}
        </div>
    )
}

