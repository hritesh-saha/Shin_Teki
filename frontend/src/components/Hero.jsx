import { ReactTyped } from "react-typed";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
export default function Hero() {
  return (
    <div className="flex justify-center items-center text-white">
      <div className="max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center p-10">
        <div className="flex justify-center items-center md:text-7xl sm:text-6xl text-4xl font-bold text-[#FF007F] md:py-4">
          <div className="mx-4">Shin Teki</div>
          <div>
            <img
              className="h-[40px] w-[40px]"
              src="/ShinTeki.jpeg"
              alt="Shin Teki"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <motion.p initial={{ opacity: 0, y: 200 }} animate={{ opacity: 1, y: 0 }}  transition={{ duration: 2 }} className="md:text-5xl sm:text-4xl text-xl font-bold">
            Communication is more than words
          </motion.p>

          {/* Added min-h-[60px] to maintain space for ReactTyped text */}
          <motion.div
            initial={{ opacity: 0, y: -200 }} animate={{ opacity: 1, y: 0 }}  transition={{ duration: 2 }}
            className="leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-[#FF007F] 
                md:text-5xl sm:text-4xl text-xl font-bold mt-2 min-h-[80px] w-full max-w-[700px] whitespace-nowrap"
          >
            <ReactTyped
              strings={["Sign Language Detection", "Real Time"]}
              typeSpeed={70}
              backSpeed={50}
              loop
            />
          </motion.div>

          {/* Button stays in place now */}
          <div className="mt-4">
            <Link to={"/stream"}>
              <motion.button
              initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 3,delay:1 }}
                type="button"
                className="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 
                                hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 
                                dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { ReactTyped } from 'react-typed';
// import { Link } from 'react-router-dom';

// export default function Hero() {
//     return (
//         <div className="flex justify-center items-center text-white">
//             <div className="max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center p-10">

//                 <div className="flex justify-center items-center md:text-7xl sm:text-6xl text-4xl font-bold  text-[#FF007F] md:py-4"><div className='mx-4'>Shin Teki</div><div><img  className="h-[40px] w-[40px]" src="/ShinTeki.jpeg" alt="Shin Teki" /></div></div>
//                 <div className="flex flex-col justify-center items-center">
//                     <p className="md:text-5xl sm:text-4xl text-xl font-bold">Communication is more than words</p>
//                     <div className="leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-[#FF007F]  md:text-5xl sm:text-4xl text-xl font-bold mt-2">
//                         <ReactTyped
//                             strings={["Sign Language Detection", "Real Time"]}
//                             typeSpeed={70}
//                             backSpeed={50}
//                             loop
//                         />
//                     </div>
//                     <div>
//                     <Link to={"/stream"}><button type="button" className="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 my-2">Get Started</button>
//                     </Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
