import * as migration_20251222_050810_initial from './20251222_050810_initial';

export const migrations = [
  {
    up: migration_20251222_050810_initial.up,
    down: migration_20251222_050810_initial.down,
    name: '20251222_050810_initial'
  },
];
