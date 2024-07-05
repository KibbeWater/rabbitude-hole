export default async function DashLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className='flex flex-col items-center pt-16'>
            <div className='container'>{children}</div>
        </main>
    );
}
