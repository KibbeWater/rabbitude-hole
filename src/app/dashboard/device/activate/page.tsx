export default async function Device() {
    return (
        <main className='flex flex-col items-center pt-16'>
            <div className='container'>
                <div className='flex justify-between'>
                    <h1 className='font-grotesk text-8xl font-light'>activate</h1>{' '}
                    <p className='h-full self-end text-right font-grotesk'>
                        scan the QR code with your r1 to
                        <br />
                        activate your device.
                    </p>
                </div>
            </div>
        </main>
    );
}
