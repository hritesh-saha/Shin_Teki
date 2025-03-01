import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Shin from "../contracts/Shin.json";

function ShinC() {
    const [state, setState] = useState({ web3: null, contract: null });
    const [allData, setAllData] = useState([]);

    useEffect(() => {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        async function init() {
            try {
                const web3 = new Web3(provider);
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = Shin.networks[networkId];
                if (deployedNetwork) {
                    const contract = new web3.eth.Contract(Shin.abi, deployedNetwork.address);
                    setState({ web3, contract });
                    getAllData(contract);
                } else {
                    console.error("Contract not deployed to detected network.");
                }
            } catch (error) {
                console.error("Error initializing Web3:", error);
            }
        }
        init();
    }, []);

    async function getAllData(contract) {
        if (!contract) {
            console.error("Contract not initialized yet.");
            return;
        }

        try {
            const data = await contract.methods.getAllData().call();
            const timestamps = data[0];
            const values = data[1];
            const formattedData = timestamps.map((ts, index) => ({
                timestamp: new Date(parseInt(ts) * 1000).toLocaleString(),
                value: values[index]
            }));
            setAllData(formattedData);
        } catch (error) {
            console.error("Error fetching all data:", error);
        }
    }

    return (
        <div className="bg-neutral-800 min-h-screen flex flex-col justify-center items-center space-y-6">
        <div className="p-6 max-w-2xl mx-auto bg-neutral-600 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl text-white font-bold">Speech Data Interaction</h2>
            <div>
                <h3 className="text-lg font-semi text-white bold mt-4">All Stored Data:</h3>
                <table className="min-w-full bg-neutral-500 border border-gray-300 mt-2">
                    <thead>
                        <tr className="bg-[#FF007F]">
                            <th className="border text-white px-4 py-2">Timestamp</th>
                            <th className="border text-white px-4 py-2">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allData.map((entry, index) => (
                            <tr key={index} className="border-b ">
                                <td className="border px-4 py-2 text-white">{entry.timestamp}</td>
                                <td className="border px-4 py-2 text-white">{entry.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}

export default ShinC;
