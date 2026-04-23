'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RepoProviderSelector } from '@/components/RepoProviderSelector';
import { useRepoConnection } from '@/contexts/RepoConnectionContext';
import {
  clearInitWizardDraft,
  loadInitWizardDraft,
  saveInitWizardDraft,
  type InitWizardDraft,
} from '@/lib/init/initWizardStorage';

type InitWizardProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (summary: string, nextPrompt: string) => void;
};

type UserType =
  | 'vibe-coder'
  | 'intermediate-dev'
  | 'senior-dev'
  | 'enterprise-architect'
  | 'non-technical';
type WorkGoal =
  | 'new-app'
  | 'existing-repo'
  | 'broken-env'
  | 'roadmap'
  | 'learning'
  | 'other';
type EnvironmentChoice = 'new-environment' | 'existing-repo' | 'not-sure';

const STEP_TITLES = ['Identity', 'Goal', 'Environment', 'Repo Bind', 'Summary'];

function getDefaultDraft(): InitWizardDraft {
  return {
    open: false,
    step: 0,
    userType: 'intermediate-dev',
    workGoal: 'existing-repo',
    environment: 'existing-repo',
    customGoal: '',
    frontend: 'Next.js',
    backend: 'Node.js',
    database: 'Postgres',
    orgName: '',
    workspaceName: '',
    roleName: 'operator',
  };
}

export function InitWizardModal({
  open,
  onClose,
  onComplete,
}: InitWizardProps) {
  const {
    repoProvider,
    repoRoot,
    githubToken,
    gitlabToken,
    bitbucketToken,
  } = useRepoConnection();
  const restoredDraftRef = useRef(false);
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<UserType>('intermediate-dev');
  const [workGoal, setWorkGoal] = useState<WorkGoal>('existing-repo');
  const [environment, setEnvironment] =
    useState<EnvironmentChoice>('existing-repo');
  const [customGoal, setCustomGoal] = useState('');
  const [frontend, setFrontend] = useState('Next.js');
  const [backend, setBackend] = useState('Node.js');
  const [database, setDatabase] = useState('Postgres');
  const [orgName, setOrgName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [roleName, setRoleName] = useState('operator');

  useEffect(() => {
    if (!open || restoredDraftRef.current) return;

    const draft = loadInitWizardDraft();
    const source = draft ?? getDefaultDraft();

    setStep(source.step);
    setUserType(source.userType as UserType);
    setWorkGoal(source.workGoal as WorkGoal);
    setEnvironment(source.environment as EnvironmentChoice);
    setCustomGoal(source.customGoal);
    setFrontend(source.frontend);
    setBackend(source.backend);
    setDatabase(source.database);
    setOrgName(source.orgName);
    setWorkspaceName(source.workspaceName);
    setRoleName(source.roleName);
    restoredDraftRef.current = true;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    saveInitWizardDraft({
      open: true,
      step,
      userType,
      workGoal,
      environment,
      customGoal,
      frontend,
      backend,
      database,
      orgName,
      workspaceName,
      roleName,
    });
  }, [
    open,
    step,
    userType,
    workGoal,
    environment,
    customGoal,
    frontend,
    backend,
    database,
    orgName,
    workspaceName,
    roleName,
  ]);

  useEffect(() => {
    if (!open || step !== 2) return;

    const providerAuthorized =
      (repoProvider === 'github' && Boolean(githubToken)) ||
      (repoProvider === 'gitlab' && Boolean(gitlabToken)) ||
      (repoProvider === 'bitbucket' && Boolean(bitbucketToken));

    if (providerAuthorized) {
      setStep(3);
    }
  }, [
    open,
    step,
    repoProvider,
    githubToken,
    gitlabToken,
    bitbucketToken,
  ]);

  const goalLabel = useMemo(() => {
    switch (workGoal) {
      case 'new-app':
        return 'Create a new app';
      case 'existing-repo':
        return 'Connect an existing repo';
      case 'broken-env':
        return 'Fix a broken environment';
      case 'roadmap':
        return 'Generate or refine a roadmap';
      case 'learning':
        return 'Learn / study';
      default:
        return customGoal || 'Something else';
    }
  }, [customGoal, workGoal]);

  const summary = useMemo(() => {
    const enterpriseLine =
      orgName || workspaceName || roleName
        ? `Enterprise setup: org=${orgName || 'n/a'}, workspace=${workspaceName || 'n/a'}, role=${roleName}`
        : 'Enterprise setup: not requested';

    return [
      `User type: ${userType}`,
      `Goal: ${goalLabel}`,
      `Environment: ${environment}`,
      `Repo provider: ${repoProvider}`,
      `Repo root: ${repoRoot || 'n/a'}`,
      enterpriseLine,
      `Suggested next step: create a plan from this setup and preview the diff before confirm`,
    ].join('\n');
  }, [
    environment,
    goalLabel,
    orgName,
    repoProvider,
    repoRoot,
    roleName,
    userType,
    workspaceName,
  ]);

  const nextPrompt = useMemo(() => {
    const goal = goalLabel.toLowerCase();
    return `Plan the next steps for: ${goal}. Preview the work, confirm the changes, and keep it sandboxed.`;
  }, [goalLabel]);

  const resetAndClose = () => {
    clearInitWizardDraft();
    restoredDraftRef.current = false;
    setStep(0);
    onClose();
  };

  const finish = () => {
    clearInitWizardDraft();
    restoredDraftRef.current = false;
    onComplete(summary, nextPrompt);
    setStep(0);
  };

  if (!open) return null;

  return (
    <div className="init-wizard-overlay" onClick={resetAndClose}>
      <div className="init-wizard-panel" onClick={(e) => e.stopPropagation()}>
        <header className="init-wizard-header">
          <div>
            <div className="init-wizard-kicker">/init</div>
            <h2>Onboarding Wizard</h2>
            <p>Set up provider, repo, and first-run intent.</p>
          </div>
          <button
            type="button"
            className="init-wizard-close"
            onClick={resetAndClose}
          >
            ✕
          </button>
        </header>

        <div className="init-wizard-steps">
          {STEP_TITLES.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`init-wizard-step ${step === index ? 'is-active' : ''}`}
              onClick={() => setStep(index)}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        <div className="init-wizard-body">
          {step === 0 && (
            <div className="init-wizard-grid">
              <label>
                <span>User type</span>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                >
                  <option value="vibe-coder">Vibe coder / self-taught</option>
                  <option value="intermediate-dev">
                    Intermediate developer
                  </option>
                  <option value="senior-dev">Senior developer</option>
                  <option value="enterprise-architect">
                    Enterprise / architect
                  </option>
                  <option value="non-technical">Non-technical</option>
                </select>
              </label>
              <label className="init-wizard-span-2">
                <span>Work goal</span>
                <select
                  value={workGoal}
                  onChange={(e) => setWorkGoal(e.target.value as WorkGoal)}
                >
                  <option value="new-app">Create a new app</option>
                  <option value="existing-repo">
                    Connect to an existing repo
                  </option>
                  <option value="broken-env">Fix a broken environment</option>
                  <option value="roadmap">Generate or refine a roadmap</option>
                  <option value="learning">Learn / study</option>
                  <option value="other">Something else</option>
                </select>
              </label>
              {workGoal === 'other' && (
                <label className="init-wizard-span-2">
                  <span>Describe the goal</span>
                  <input
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                  />
                </label>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="init-wizard-grid">
              <label>
                <span>Environment choice</span>
                <select
                  value={environment}
                  onChange={(e) =>
                    setEnvironment(e.target.value as EnvironmentChoice)
                  }
                >
                  <option value="new-environment">New environment</option>
                  <option value="existing-repo">Existing repo</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </label>
              {environment === 'new-environment' && (
                <>
                  <label>
                    <span>Frontend framework</span>
                    <input
                      value={frontend}
                      onChange={(e) => setFrontend(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Backend language</span>
                    <input
                      value={backend}
                      onChange={(e) => setBackend(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Database type</span>
                    <input
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="init-wizard-stack">
              <p className="init-wizard-note">
                Provider selection and repo binding stay synced with the center
                pane through the shared repo context.
              </p>
              <RepoProviderSelector />
            </div>
          )}

          {step === 3 && (
            <div className="init-wizard-grid">
              <label>
                <span>Org name</span>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc"
                />
              </label>
              <label>
                <span>Workspace name</span>
                <input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Platform Ops"
                />
              </label>
              <label>
                <span>Initial role</span>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                >
                  <option value="owner">owner</option>
                  <option value="admin">admin</option>
                  <option value="operator">operator</option>
                  <option value="collaborator">collaborator</option>
                  <option value="customer">customer</option>
                </select>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="init-wizard-stack">
              <pre className="init-wizard-summary">{summary}</pre>
            </div>
          )}
        </div>

        <footer className="init-wizard-footer">
          <button
            type="button"
            className="init-wizard-secondary"
            onClick={resetAndClose}
          >
            Cancel
          </button>
          <div className="init-wizard-footer-actions">
            {step > 0 && (
              <button
                type="button"
                className="init-wizard-secondary"
                onClick={() => setStep((v) => v - 1)}
              >
                Back
              </button>
            )}
            {step < STEP_TITLES.length - 1 ? (
              <button
                type="button"
                className="init-wizard-primary"
                onClick={() => setStep((v) => v + 1)}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="init-wizard-primary"
                onClick={finish}
              >
                Save setup
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
