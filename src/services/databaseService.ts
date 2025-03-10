import SQLite from 'react-native-sqlite-storage';

// Enable debug logs in development
SQLite.DEBUG(!!__DEV__);
// Initialize SQLite
SQLite.enablePromise(true);

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      const db = await SQLite.openDatabase({
        name: 'HighIOPApp.db',
        location: 'default',
      });
      
      this.database = db;
      
      // Create tables if they don't exist
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const createProfileTable = `
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        photoURL TEXT
      );
    `;

    try {
      await this.database.executeSql(createProfileTable);
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async createProfile(profile: UserProfile): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const { id, name, email, photoURL } = profile;
    
    try {
      await this.database.executeSql(
        'INSERT INTO profiles (id, name, email, photoURL) VALUES (?, ?, ?, ?)',
        [id, name, email, photoURL || null]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async updateProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const updates: string[] = [];
    const values: any[] = [];

    if (profile.name) {
      updates.push('name = ?');
      values.push(profile.name);
    }
    if (profile.email) {
      updates.push('email = ?');
      values.push(profile.email);
    }
    if ('photoURL' in profile) {
      updates.push('photoURL = ?');
      values.push(profile.photoURL || null);
    }

    if (updates.length === 0) return;

    values.push(profile.id);
    
    try {
      await this.database.executeSql(
        `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const [results] = await this.database.executeSql(
        'SELECT * FROM profiles WHERE id = ?',
        [id]
      );

      if (results.rows.length === 0) return null;

      return results.rows.item(0);
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.executeSql(
        'DELETE FROM profiles WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService(); 