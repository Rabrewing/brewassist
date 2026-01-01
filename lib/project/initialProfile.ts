import * as fs from 'fs';
import * as path from 'path';
import { InitialProjectProfile } from '../init/initEngine';

export class InitialProjectProfileManager {
  private storagePath: string;

  constructor(
    storagePath: string = path.join(
      process.cwd(),
      '.brewassist',
      'initial-profile.json'
    )
  ) {
    this.storagePath = storagePath;
  }

  saveProfile(profile: InitialProjectProfile): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      this.storagePath,
      JSON.stringify(profile, null, 2),
      'utf8'
    );
  }

  loadProfile(): InitialProjectProfile | null {
    try {
      if (!fs.existsSync(this.storagePath)) return null;
      const data = fs.readFileSync(this.storagePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  hasProfile(): boolean {
    return fs.existsSync(this.storagePath);
  }

  deleteProfile(): void {
    if (fs.existsSync(this.storagePath)) {
      fs.unlinkSync(this.storagePath);
    }
  }
}
