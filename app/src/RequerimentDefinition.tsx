import React from 'react';
import Timer from './Timer';
import RequirementCard from './RequirementCard';



const RequirementDefinition: React.FC = () => {
  return (
    <div className="min-w-screen min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="border border-white rounded-lg p-4 w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div className="w-full font-mono bg-white text-black py-4 mb-6 mx-8 rounded-md shadow-md text-center text-2xl font-bold">
            Time 1
          </div>
          <Timer initialMinutes={5} initialSeconds={0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 justify-items-center">
          <div className="flex flex-col items-center space-y-4">
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="blue" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="yellow" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="purple" />
          </div>

          <div className="flex flex-col items-center space-y-4">
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="yellow" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="purple" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="blue" />
          </div>

          <div className="flex flex-col items-center space-y-4">
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="purple" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="yellow" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="blue" />
          </div>

          <div className="flex flex-col items-center space-y-4">
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="purple" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="yellow" />
            <RequirementCard title={'BLA'} description={'BLA BLA'} color="blue" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementDefinition;