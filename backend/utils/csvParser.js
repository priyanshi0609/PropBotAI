import fs from 'fs';
import csv from 'csv-parser';

export class CSVParser {
  constructor() {
    this.projects = [];
    this.addresses = [];
    this.configurations = [];
    this.variants = [];
    this.loaded = false;
  }

  async loadAllData() {
    await Promise.all([
      this.loadCSV('./data/project.csv', this.projects),
      this.loadCSV('./data/ProjectAddress.csv', this.addresses),
      this.loadCSV('./data/ProjectConfiguration.csv', this.configurations),
      this.loadCSV('./data/ProjectConfigurationVariant.csv', this.variants)
    ]);
    this.loaded = true;
    console.log('All CSV data loaded successfully');
  }

  loadCSV(filePath, storage) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        resolve();
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => storage.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
  }

  // Join all data for comprehensive property search
  getJoinedData() {
    if (!this.loaded) return [];

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

    return joinedData.filter(item => item.variants.length > 0);
  }
}

export const csvParser = new CSVParser();