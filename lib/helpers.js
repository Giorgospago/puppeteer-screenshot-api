const fs = require("fs");
const cp = require('child_process');

const rm = (pathDir) => {
    return new Promise(resolve => {
        try {
            fs.rm(pathDir, {recursive: true, force: true}, resolve);
        } catch (e) {
            resolve();
        }
    });
};

const exec = (cmd) => {
    return new Promise(resolve => {
        try {
            cp.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    return resolve(error);
                }
                if (stderr) {
                    return resolve(stderr);
                }
                if (stdout) {
                    return resolve(stdout);
                }
            });
        } catch (e) {
            resolve(e);
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
    rm, exec,
    calculateRatio
};
