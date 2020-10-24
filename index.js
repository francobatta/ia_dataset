const csv = require("csv-parser");
const fs = require("fs");
const _ = require("lodash");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const getPropLowerAndTrim = (arr, prop) => arr.map(elem => elem[prop]).map(str => str.toLowerCase()).map(str => str.trim())

const actual_country_list = require("./country_list.json");

const csvWriter = createCsvWriter({
  path: "out.csv",
  header: [
    { id: "country_txt", title: "country_txt" },
    { id: "date", title: "date" },
  ],
});

const map_old_country_to_new = new Map([
  ["East Germany (GDR)", "Germany"],
  ["West Germany (FRG)", "Germany"],
  ["South Yemen", "Yemen"],
  ["Czechoslovakia", "Czech Republic"],
  ["South Vietnam", "Vietnam"],
  ["Zaire", "Congo"],
  ["North Yemen", "Yemen"],
  ["Rhodesia", "Zimbabwe"],
  ["Soviet Union", "Russia"],
  ["Democratic Republic of the Congo", "Congo"],
  ["Republic of the Congo", "Congo"],
  ["People's Republic of the Congo", "Congo"],
  ["Serbia-Montenegro", "Serbia"],
]);

const array_all_data = [];

fs.createReadStream("input.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (map_old_country_to_new.get(row.country_txt))
      row.country_txt = map_old_country_to_new.get(row.country_txt)
    if (!row.date.includes('/0/'))
	    array_all_data.push(row);
  })
  .on("end", () => {
    // prepare for info
	const improved_country_list = getPropLowerAndTrim(actual_country_list, 'name')
	const dataset_countries = getPropLowerAndTrim(array_all_data, 'country_txt')

    // process and show info
    const unique_countries_dataset = _.uniq(dataset_countries);
    const countries_in_dataset_not_in_actual_country_list_array = _.difference(unique_countries_dataset, improved_country_list);
    console.log('Amount of countries in dataset: ' + unique_countries_dataset.length);
    console.log(countries_in_dataset_not_in_actual_country_list_array);

	// write actual output
    csvWriter
      .writeRecords(array_all_data)
      .then(() => console.log("The CSV file was written successfully"));
  });
