
import { BlotatoAccount } from "../types";

/**
 * Mocking Blotato API response based on an API Key.
 * In production, this would be a fetch call to Blotato's v1/accounts endpoint.
 * Blotato uses unique User IDs for each linked social identity.
 */
export async function fetchBlotatoAccounts(apiKey: string): Promise<BlotatoAccount[]> {
  if (!apiKey || apiKey.length < 5) return [];

  // Simulate network delay for realistic integration feel
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Return richer mock data that demonstrates multiple accounts per platform
  // This allows the user to test the dropdown selector in the Scheduler.
  return [
    { id: 'uid_ig_001', platform: 'instagram', name: 'Main Brand Identity', handle: '@Shooter_Official' },
    { id: 'uid_ig_002', platform: 'instagram', name: 'Personal BTS', handle: '@TheShooter_Life' },
    { id: 'uid_ig_003', platform: 'instagram', name: 'Niche Sub-Account', handle: '@Shooter_Aesthetic' },
    { id: 'uid_tt_001', platform: 'tiktok', name: 'Primary Viral Hub', handle: '@shooter_main' },
    { id: 'uid_tt_002', platform: 'tiktok', name: 'Backup Channel', handle: '@shooter_backup' },
    { id: 'uid_fb_001', platform: 'facebook', name: 'Official Page', handle: 'TheShooterStudio' },
    { id: 'uid_fb_002', platform: 'facebook', name: 'Community Group Admin', handle: 'ShooterCreators' },
    { id: 'uid_yt_001', platform: 'youtube', name: 'Shorts Factory', handle: 'ShooterStudios' },
    { id: 'uid_yt_002', platform: 'youtube', name: 'Main Channel', handle: 'TheShooterAI' },
    { id: 'uid_tw_001', platform: 'twitter', name: 'X Feed Main', handle: '@TheShooterAI' },
    { id: 'uid_th_001', platform: 'threads', name: 'Threads Hub', handle: '@TheShooter' },
    { id: 'uid_bs_001', platform: 'bluesky', name: 'Bluesky Proto', handle: 'shooter.bsky.social' },
  ];
}
