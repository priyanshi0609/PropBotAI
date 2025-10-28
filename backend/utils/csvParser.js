const fs = require('fs');
const csv = require('csv-parser');

class CSVParser {
  constructor() {
    this.projects = [];
    this.addresses = [];
    this.configurations = [];
    this.variants = [];
    this.loaded = false;
  }

  async loadAllData() {
    try {
      await Promise.all([
        this.loadCSV('./data/project.csv', this.projects),
        this.loadCSV('./data/ProjectAddress.csv', this.addresses),
        this.loadCSV('./data/ProjectConfiguration.csv', this.configurations),
        this.loadCSV('./data/ProjectConfigurationVariant.csv', this.variants)
      ]);
      this.loaded = true;
      console.log('All CSV data loaded successfully');
      console.log('Projects:', this.projects.length);
      console.log('Addresses:', this.addresses.length);
      console.log('Configurations:', this.configurations.length);
      console.log('Variants:', this.variants.length);
    } catch (error) {
      console.error('Error loading CSV data:', error);
    }
  }

  loadCSV(filePath, storage) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        reject(new Error(`File not found: ${filePath}`));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => storage.push(data))
        .on('end', () => {
          console.log(`Loaded ${storage.length} records from ${filePath}`);
          resolve();
        })
        .on('error', reject);
    });
  }

  // Join all data for comprehensive property search
  getJoinedData() {
    if (!this.loaded) {
      console.log('Data not loaded yet');
      return [];
    }

    const joinedData = this.projects.map(project => {
      const address = this.addresses.find(addr => addr.projectId === project.id);
      const configs = this.configurations.filter(config => config.projectId === project.id);
      
      const variants = configs.flatMap(config => 
        this.variants.filter(variant => variant.configurationId === config.id)
          .map(variant => ({
            ...variant,
            configuration: config
          }))
      );

      return {
        project,
        address,
        configurations: configs,
        variants
      };
    });

    const validData = joinedData.filter(item => item.variants.length > 0);
    console.log(`Joined data: ${validData.length} valid properties`);
    return validData;
  }
}

const csvParser = new CSVParser();

module.exports = { CSVParser, csvParser };