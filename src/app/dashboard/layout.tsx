export default async function DashLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className='flex min-h-full flex-col items-center pt-16'>
            <div className='container flex min-h-full flex-col'>{children}</div>
        </main>
    );
}
