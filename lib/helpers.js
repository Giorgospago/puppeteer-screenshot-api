const fs = require("fs");

const rm = (pathDir) => {
    return new Promise(resolve => {
        try {
            fs.rm(pathDir, {recursive: true, force: true}, resolve);
        } catch (e) {
            resolve();
        }
    });
};

const calculateRatio = (num_1, num_2) => {
    for (num = num_2; num > 1; num--) {
        if ((num_1 % num) == 0 && (num_2 % num) == 0) {
            num_1 = num_1 / num;
            num_2 = num_2 / num;
        }
    }
    return num_1 + ":" + num_2;
};

module.exports = {
    rm,
    calculateRatio
};
