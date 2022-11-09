export function Container({ children }) {
    return (
        <div className="py-[25px] px-[50px] rounded-xl bg-black/75 flex flex-col justify-center min-w-fit border-[3px] border-solid border-white">
            {children}
        </div>
    )
}

export function DashboardContainer({ children }) {
    return (
        <div className="py-10 px-5 rounded-xl bg-black/75 flex flex-col justify-around w-full m-w-fit md:w-1/3 lg:w-1/4 text-left border-[5px] border-solid border-white">
            {children}
        </div>
    )
}