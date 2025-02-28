import { ReactTyped } from 'react-typed';
import { Link } from 'react-router-dom';


export default function Hero() {
    return (
        <div className="flex justify-center items-center text-white">
            <div className="max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center p-10">
               
                <div className="flex justify-center items-center md:text-7xl sm:text-6xl text-4xl font-bold  text-[#FF007F] md:py-4"><div className='mx-4'>Shin Teki</div><div><img  className="h-[40px] w-[40px]" src="/ShinTeki.jpeg" alt="Shin Teki" /></div></div>
                <div className="flex flex-col justify-center items-center">
                    <p className="md:text-5xl sm:text-4xl text-xl font-bold">Communication is more than words</p>
                    <div className="leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-[#FF007F]  md:text-5xl sm:text-4xl text-xl font-bold mt-2"> 
                        <ReactTyped
                            strings={["Sign Language Detection", "Real Time"]}
                            typeSpeed={70}
                            backSpeed={50}
                            loop
                        />
                    </div>
                    <div>
                    <Link to={"/"}><button type="button" class="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 my-2">Get Started</button>
                    </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
