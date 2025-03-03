// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

contract Shin {
    mapping(uint256 => string) public dataMap;
    uint256[] private timestamps;

    function storeString(string memory value) public {
        uint256 currentTime = block.timestamp;
        dataMap[currentTime] = value;
        timestamps.push(currentTime);
    }

    function getAllData() public view returns (uint256[] memory, string[] memory) {
        string[] memory values = new string[](timestamps.length);
        for (uint256 i = 0; i < timestamps.length; i++) {
            values[i] = dataMap[timestamps[i]];
        }
        return (timestamps, values);
    }
}
