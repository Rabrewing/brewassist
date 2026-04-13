'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  DEVOPS8_DEFAULT_RUNTIME,
  type DevOps8RuntimeEvent,
  type DevOps8RuntimeSnapshot,
  reduceDevOps8Runtime,
} from '@/lib/devops8/runtimeBus';

interface DevOps8RuntimeContextValue {
  runtime: DevOps8RuntimeSnapshot;
  setRuntime: React.Dispatch<React.SetStateAction<DevOps8RuntimeSnapshot>>;
  recordEvent: (event: DevOps8RuntimeEvent) => void;
}

const DevOps8RuntimeContext = createContext<
  DevOps8RuntimeContextValue | undefined
>(undefined);

export function DevOps8RuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [runtime, setRuntime] = useState<DevOps8RuntimeSnapshot>(
    DEVOPS8_DEFAULT_RUNTIME
  );

  const recordEvent = (event: DevOps8RuntimeEvent) => {
    setRuntime((prev) => reduceDevOps8Runtime(prev, event));
  };

  return (
    <DevOps8RuntimeContext.Provider
      value={{ runtime, setRuntime, recordEvent }}
    >
      {children}
    </DevOps8RuntimeContext.Provider>
  );
}

export function useDevOps8Runtime() {
  const context = useContext(DevOps8RuntimeContext);
  if (!context) {
    throw new Error(
      'useDevOps8Runtime must be used within a DevOps8RuntimeProvider'
    );
  }
  return context;
}
