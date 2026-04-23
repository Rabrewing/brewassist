export type InitWizardDraft = {
  open: boolean;
  step: number;
  userType: string;
  workGoal: string;
  environment: string;
  customGoal: string;
  frontend: string;
  backend: string;
  database: string;
  orgName: string;
  workspaceName: string;
  roleName: string;
};

const INIT_WIZARD_DRAFT_KEY = 'brewassist.init.draft';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadInitWizardDraft(): InitWizardDraft | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(INIT_WIZARD_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as InitWizardDraft;
  } catch {
    return null;
  }
}

export function saveInitWizardDraft(draft: InitWizardDraft) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(INIT_WIZARD_DRAFT_KEY, JSON.stringify(draft));
}

export function clearInitWizardDraft() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(INIT_WIZARD_DRAFT_KEY);
}

export function shouldResumeInitWizard() {
  const draft = loadInitWizardDraft();
  return Boolean(draft?.open);
}

export function advanceInitWizardAfterProviderAuth() {
  const draft = loadInitWizardDraft();
  if (!draft) return;

  const nextStep = draft.step === 2 ? 3 : draft.step;
  saveInitWizardDraft({
    ...draft,
    open: true,
    step: nextStep,
  });
}
