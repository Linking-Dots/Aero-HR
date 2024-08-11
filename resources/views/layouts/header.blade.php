

<header id="page-topbar">
    <div class="layout-width">
        <div class="navbar-header">
            <div class="d-flex">
                <!-- LOGO -->
                <div class="navbar-brand logo">
                    <a href="{{ route('dashboard') }}" class="logo logo-dark">
                        <span class="logo-sm">
                            <img src="{{ asset('assets/images/logo.png') }}" alt="" height="50" />
                        </span>
                        <span class="logo-lg">
                            <img src="{{ asset('assets/images/logo.png') }}" alt="" height="40" />
                        </span>
                    </a>

                    <a href="{{ route('dashboard') }}" class="logo logo-light">
                        <span class="logo-sm">
                            <img src="{{ asset('assets/images/logo.png') }}" alt="" height="50" />
                        </span>
                        <span class="logo-lg">
                            <img src="{{ asset('assets/images/logo.png') }}" alt="" height="40" />
                        </span>
                    </a>
                </div>

                <button type="button" class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger" id="topnav-hamburger-icon">
                    <span class="las la-angle-double-right fs-22">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>


            </div>

            <div class="d-flex align-items-center">

                <div class="ms-1 header-item d-sm-flex">
                    <button type="button" class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle" data-toggle="fullscreen">
                        <i class='bx bx-fullscreen fs-22'></i>
                    </button>
                </div>

                <div class="ms-1 header-item d-sm-flex">
                    <button type="button" class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode">
                        <i class='bx bx-moon fs-22'></i>
                    </button>
                </div>

                <div class="dropdown ms-sm-3 header-item topbar-user">
                    <button type="button" class="btn" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="d-flex align-items-center">
                            <img class="rounded-circle header-profile-user" src="{{ asset('assets/images/users/' . Auth::user()->user_name . '.jpg') }}" alt="Header Avatar" />
                            <span class="text-start ms-xl-2">
                                <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{{ Auth::user()->first_name }} {{ Auth::user()->last_name }}</span>
                                <span class="d-none d-xl-block ms-1 fs-12 user-name-sub-text">{{ Auth::user()->position }}</span>
                            </span>
                        </span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <!-- item-->
                        <h6 class="dropdown-header">Welcome {{ Auth::user()->first_name }}!</h6>
                        <a class="dropdown-item" href="{{ route('profile') }}"><i class="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i><span class="align-middle">Profile</span></a>
                        <a class="dropdown-item" href="#"><i class="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i><span class="align-middle">Messages</span></a>
                        <a class="dropdown-item" href="#"><i class="mdi mdi-calendar-check-outline text-muted fs-16 align-middle me-1"></i><span class="align-middle">Taskboard</span></a>
                        <a class="dropdown-item" href="#"><i class="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i><span class="align-middle">Help</span></a>
                        <div class="dropdown-divider"></div>
                        <form action="{{ route('logout') }}" method="POST">
                            @csrf
                            <button class="dropdown-item" type="submit"><i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>Logout</button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
