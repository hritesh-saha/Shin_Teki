var Shin= artifacts.require("./Shin.sol")

module.exports=async function(deployer){
    await deployer.deploy(Shin);
}