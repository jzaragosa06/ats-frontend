import profileUser from "../assets/profile-user.png";

export default function MessageBox({ message, sender, date }) {
    return (


        <div className="my-4 border border-gray-light rounded-lg p-6">

            <div className="mb-3 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                    <img
                        src={profileUser}
                        alt="User Profile"
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>


                <div className="flex-col">
                    <h3 className="headline text-gray-dark">{sender}</h3>
                    <p className="body-tiny text-gray-400">{date}</p>
                </div>
            </div>
            <style>
            </style>
            <div className="space-y-4 text-gray-dark body-regular">
                <div
                    dangerouslySetInnerHTML={{
                        __html: message,
                    }}
                    className="[&_ul]:list-disc [&_ul]:pl-6
            [&_ol]:list-decimal [&_ol]:pl-6
            [&_em]:font-inherit
            [&_strong]:font-avenir-black
            [&_strong_em]:font-inherit
            [&_em_strong]:font-inherit"
                />
            </div>
        </div>

    );
}