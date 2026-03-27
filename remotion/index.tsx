import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { AllynIntro } from './components/AllynIntro';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AllynIntro"
        component={AllynIntro}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
