import fs from 'fs';

const writeStringToFile = async ( path,
    data,
) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf-8', (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

const readStringFromFile = async ( path ) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: "utf8" }, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

export const jsonFileToObject = async (path) => {
    try {
        const jsonString = await readStringFromFile(path);
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error('Could not read json file');
    }
}

export const objectToJsonFile = async (path, data) => {
    try {
        const jsonString = JSON.stringify(data);
        await writeStringToFile(path, jsonString);
    } catch (error) {
        throw new Error('Could not write json file');
    }
}