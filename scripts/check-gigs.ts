import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function checkGigsTable() {
    try {
        const result = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'gigs' 
      ORDER BY ordinal_position
    `);
        console.log('Columns in gigs table:');
        // Result is an array
        if (Array.isArray(result)) {
            result.forEach((row: any) => console.log(' -', row.column_name));
        } else {
            console.log('Result type:', typeof result);
            console.log('Result:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}
checkGigsTable();
