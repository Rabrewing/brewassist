import * as fs from 'fs';
import * as path from 'path';
import { resolveModeProfile } from '../mode/modeResolver';
import { ModeProfile } from '../mode/modeProfiles';

export interface ProjectDetection {
  projectType: 'new' | 'existing';
  repoProvider: 'github' | 'gitlab' | 'bitbucket' | 'local' | 'unknown';
  stack: {
    language: string[];
    framework?: string[];
    infra?: string[];
  };
  experienceLevel: 'vibe' | 'intermediate' | 'advanced';
}

export interface InitialProjectProfile {
  projectType: 'new' | 'existing';
  repoProvider: 'github' | 'gitlab' | 'bitbucket' | 'local' | 'unknown';
  stack: {
    language: string[];
    framework?: string[];
    infra?: string[];
  };
  experienceLevel: 'vibe' | 'intermediate' | 'advanced';
  selectedMode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP';
  toolbeltTier: 1 | 2 | 3;
  timestamp: string;
}

export class InitEngine {
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  detectProject(): ProjectDetection {
    const hasGit = fs.existsSync(path.join(this.rootDir, '.git'));
    const hasPackageJson = fs.existsSync(
      path.join(this.rootDir, 'package.json')
    );
    const hasCargoToml = fs.existsSync(path.join(this.rootDir, 'Cargo.toml'));
    const hasRequirementsTxt = fs.existsSync(
      path.join(this.rootDir, 'requirements.txt')
    );
    const hasDockerfile = fs.existsSync(path.join(this.rootDir, 'Dockerfile'));
    const hasGithub = fs.existsSync(path.join(this.rootDir, '.github'));
    const hasGitlab = fs.existsSync(path.join(this.rootDir, '.gitlab-ci.yml'));
    const hasBitbucket = fs.existsSync(
      path.join(this.rootDir, '.bitbucket-pipelines.yml')
    );

    let repoProvider: ProjectDetection['repoProvider'] = 'unknown';
    if (hasGithub) repoProvider = 'github';
    else if (hasGitlab) repoProvider = 'gitlab';
    else if (hasBitbucket) repoProvider = 'bitbucket';
    else if (!hasGit) repoProvider = 'local';

    const projectType = hasGit ? 'existing' : 'new';

    let languages: string[] = [];
    let frameworks: string[] = [];
    let infra: string[] = [];

    if (hasPackageJson) {
      languages.push('javascript');
      try {
        const pkg = JSON.parse(
          fs.readFileSync(path.join(this.rootDir, 'package.json'), 'utf8')
        );
        if (pkg.dependencies?.['react']) frameworks.push('react');
        if (pkg.dependencies?.['next']) frameworks.push('nextjs');
        if (pkg.dependencies?.['vue']) frameworks.push('vue');
      } catch {
        // Ignore JSON parse errors - fallback to basic detection
      }
    }

    if (hasCargoToml) {
      languages.push('rust');
    }

    if (hasRequirementsTxt) {
      languages.push('python');
    }

    if (hasDockerfile) infra.push('docker');
    if (hasGithub || hasGitlab || hasBitbucket) infra.push('ci/cd');

    const experienceLevel = this.inferExperienceLevel(
      languages,
      frameworks,
      infra
    );

    return {
      projectType,
      repoProvider,
      stack: { language: languages, framework: frameworks, infra },
      experienceLevel,
    };
  }

  private inferExperienceLevel(
    languages: string[],
    frameworks: string[],
    infra: string[]
  ): 'vibe' | 'intermediate' | 'advanced' {
    if (infra.length > 0 || frameworks.length > 1) return 'advanced';
    if (languages.length > 1 || frameworks.length > 0) return 'intermediate';
    return 'vibe';
  }

  selectInitialMode(detection: ProjectDetection): ModeProfile {
    const { experienceLevel, stack } = detection;

    if (experienceLevel === 'vibe') return resolveModeProfile('LLM');
    if (experienceLevel === 'intermediate') return resolveModeProfile('HRM');
    if (experienceLevel === 'advanced') return resolveModeProfile('AGENT');

    return resolveModeProfile('LLM'); // fallback
  }

  createInitialProfile(
    detection: ProjectDetection,
    mode: ModeProfile
  ): InitialProjectProfile {
    return {
      projectType: detection.projectType,
      repoProvider: detection.repoProvider,
      stack: detection.stack,
      experienceLevel: detection.experienceLevel,
      selectedMode: mode.mode,
      toolbeltTier: mode.toolbeltTier,
      timestamp: new Date().toISOString(),
    };
  }
}
