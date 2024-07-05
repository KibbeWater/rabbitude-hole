import { Fragment } from 'react';

export default function DashboardHeader({ name, description }: { name: string; description: string }) {
    return (
        <div className='flex justify-between'>
            <h1 className='font-grotesk text-8xl font-light'>{name}</h1>
            <p className='h-full self-end text-right font-grotesk'>
                {description.split('\n').map((line, idx) => (
                    <Fragment key={idx}>
                        {line}
                        <br />
                    </Fragment>
                ))}
            </p>
        </div>
    );
}
