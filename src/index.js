import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs';
import { jsonFileToObject, objectToJsonFile } from './file-helper.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const currentFilePath = new URL(import.meta.url).pathname;
const currentDirectory = path.dirname(currentFilePath);
const PATH_TO_SCOTCH_JSON = path.resolve(currentDirectory, '../mocks/scotches.json');

const saveImageToDisk = (url, filename) => {
	fetch(url)
	.then(res => {
		const dest = fs.createWriteStream(filename);
		res.body.pipe(dest)
	})
	.catch((err) => {
		console.log(err);
	})
}

const createScotch = async (scotchObject) => {
	const scotchesMap = await jsonFileToObject(PATH_TO_SCOTCH_JSON);
	const id = uuidv4();
	scotchesMap[id] = { ...scotchObject, id };
	await objectToJsonFile(PATH_TO_SCOTCH_JSON, scotchesMap);
	return scotchesMap[id];
}

const run = async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto('https://www.saq.com/en/products/spirit/scotch-and-whisky?product_list_limit=24');

	await page.waitForSelector('body');
	const element = await page.waitForSelector('.product.photo.product-item-photo');
	console.log(element);
	await element.click();
	await page.setViewport( {width: 1400, height: 1024});
	// console.log(element);

	// trying to grab image
	const image = await page.waitForSelector('.MagicZoom')
	const hrefHandle = await image.getProperty('href');
	const hrefImage = await hrefHandle.jsonValue();
	const filename = `${hrefImage}.png`;
	console.log(hrefImage);

	// trying to grab title (name of Scotch)
	const titleSelector = await page.waitForSelector('h1.page-title');
	const titleHandle = await titleSelector.getProperty('textContent');
	const messyTitle = await titleHandle.jsonValue();
	const titleRegex = /^\s+|\s+$/g;
	const title = messyTitle.replace(titleRegex, '');
	console.log(messyTitle);
	console.log(title);

	// try to save image to disk
	saveImageToDisk(filename, title);

	const scotch = {
		title: title,
		image: filename
	}

	createScotch(scotch);
	
	await browser.close();

}
		
run();
