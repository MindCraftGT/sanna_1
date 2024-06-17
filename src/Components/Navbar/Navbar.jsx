import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBell, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from '../firebase/firebase';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { signOutUser, user, userData } = useContext(AuthContext);
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const collectionRef = useMemo(() => collection(db, 'notifications'), [db]);

    useEffect(() => {
        if (user) {
            const q = query(collectionRef, where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const notificationsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotificationCount(notificationsData);
            });

            return () => unsubscribe();
        }
    }, [user, collectionRef]);

    // useEffect(() => {
    //     if (user) {
    //         const notificationsRef = collection(db, 'notifications');
    //         const q = query(notificationsRef, where('userId', '==', user.uid), where('read', '==', false));

    //         const unsubscribe = onSnapshot(q, (snapshot) => {
    //             const unreadCount = snapshot.size;
    //             console.log("Unread notifications count:", unreadCount);  // Log the count
    //             setNotificationCount(unreadCount);
    //         });

    //         return () => unsubscribe();
    //     }
    // }, [user]);

    const handleSignOut = (e) => {
        e.preventDefault();
        signOutUser();
        navigate('/login');
    };

    return (
        <div>
            <nav className='sticky top-0 bg-white-500 p-1 border-b-1 border-gray-200 shadow-md'>
                <div className="flex items-center justify-between mx-6 mr-24">
                    <div className='text-green-700 text-2xl font-bold ml-16'>
                        <Link to="/">Sanna</Link>
                    </div>
                    <div>
                        <input className='rounded-lg py-2 w-96 focus:outline-none bg-green-50 px-3' type="text" placeholder='Search' />
                    </div>

                    <div className='md:hidden'>
                        <button className='text-white' onClick={toggleMenu}>
                            <svg fill='none' stroke='green' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' viewBox='0 0 24 24' className='w-6 h-6'>
                                <path d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>

                    <ul className='hidden md:flex space-x-8'>
                        <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                            <Link to="/messaging" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                                <FontAwesomeIcon icon={faEnvelope} />
                                <span className='text-sm'>Messages</span>
                                {/* {messageCount > 0 && <span className="absolute top-3 transform translate-x-3/4 -translate-y-3/4 text-tiny bg-red-500 text-white rounded-full px-1">{messageCount}</span>} */}
                            </Link>
                        </li>
                        <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                            <Link to="/notification" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700 relative'>
                                <FontAwesomeIcon icon={faBell} />
                                <span className='text-sm'>Notification</span>
                                {notificationCount > 0 &&
                                    <span className="absolute top-0 right-0  text-tiny bg-red-500 text-white rounded-full px-1">{notificationCount}</span>
                                }
                            </Link>
                        </li>
                        <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                            <Link to="/profile" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                                <FontAwesomeIcon icon={faUser} />
                                <span className='text-sm'>Profile</span>
                            </Link>
                        </li>

                    </ul>

                    <div className="border-r border-l border-gray-500 px-3">
                        <ul>
                            <li className="group">
                                <Link to="/cross-sell">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" data-tooltip-id="cross-sale-tooltip" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="size-6 group-hover:text-green-700">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                    </svg>
                                    <Tooltip
                                        id="cross-sale-tooltip"
                                        place="bottom"
                                        effect="solid"
                                        style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                                        Cross-Sell your product
                                    </Tooltip>

                                </Link>
                            </li>
                        </ul>
                    </div>





                    <div className='flex items-center'>
                        <FontAwesomeIcon className='cursor-pointer mr-4 hover:text-green-700' data-tooltip-id="sign-out-tooltip" onClick={handleSignOut} icon={faSignOutAlt} />
                        <p className='text-sm font-roboto font-medium'>
                            {user?.displayName === null && userData?.name !== undefined
                                ? userData?.name?.charAt(0)?.toUpperCase() +
                                userData?.name?.slice(1)
                                : user?.displayName?.split(" ")[0]}
                        </p>
                        <Tooltip
                            id="sign-out-tooltip"
                            place="bottom"
                            effect="solid"
                            style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                            Sign out
                        </Tooltip>
                    </div>
                </div>

                {isMenuOpen ? (
                    <ul className='flex-col md:hidden'>
                        <li className='py hover:cursor-pointer hover:bg-green-100'>
                            <Link to="/ourwork">Our Work</Link>
                        </li>
                        <li className='py hover:cursor-pointer hover:bg-green-100'>
                            <Link to="/ourimpact">Our Impact</Link>
                        </li>
                        <li className='py hover:cursor-pointer hover:bg-green-100'>
                            <Link to="/newsandevents">News & Events</Link>
                        </li>
                        <li className='py hover:cursor-pointer hover:bg-green-100'>
                            <Link to="/becomemember">Become a Member</Link>
                        </li>
                    </ul>
                ) : null}
            </nav>
        </div>
    )
}

export default Navbar;
