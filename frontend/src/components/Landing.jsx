import Hero from "./Hero";


export default function Landing(){
    return(
        <div className="bg-gray-800 min-h-screen flex justify-center items-center">
            <div className="flex w-full flex-row  2xl:w-4/5 justify-center h-full bg-gray-900 drop-shadow-3xl border-2 hover:border-[#FF007F]">
            <div className="flex justify-center w-1/2 m-0 items-center"><Hero></Hero></div>
            </div>
            
        </div>
    )
}