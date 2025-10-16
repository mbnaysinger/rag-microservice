import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as yaml from 'yaml';
import * as fs from 'fs';

dotenv.config();

// Load .env.yml for configuration
const envYmlPath = path.resolve(__dirname, '.env.yml');
const envYmlContent = fs.readFileSync(envYmlPath, 'utf8');
const config = yaml.parse(envYmlContent);

const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: config.config.db.host,
  port: config.config.db.port,
  username: config.config.db.username,
  password: config.config.db.password,
  database: config.config.db.database,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/modules/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  ssl:
   {
    rejectUnauthorized: false,
   },
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
