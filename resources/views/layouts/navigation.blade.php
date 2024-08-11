<div class="app-menu navbar-menu">
    <!-- LOGO -->
    <div class="navbar-brand-box">
        <!-- Dark Logo-->
        <a href="{{ route('dashboard') }}" class="logo logo-dark">
            <span class="logo-sm">
                <img src="{{ asset('assets/images/logo.png') }}" alt="" height="50" />
            </span>
            <span class="logo-lg">
                <img src="{{ asset('assets/images/logo.png') }}" alt="" height="40" />
            </span>
        </a>
        <!-- Light Logo-->
        <a href="{{ route('dashboard') }}" class="logo logo-light">
            <span class="logo-sm">
                <img src="{{ asset('assets/images/logo.png') }}" alt="" height="50" />
            </span>
            <span class="logo-lg">
                <img src="{{ asset('assets/images/logo.png') }}" alt="" height="40" />
            </span>
        </a>
        <button type="button" class="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover" id="vertical-hover">
            <i class="ri-record-circle-line"></i>
        </button>
    </div>

    <div id="scrollbar">
        <div class="container-fluid">

            <div id="two-column-menu"></div>
            <ul class="navbar-nav" id="navbar-nav">
                <li class="menu-title"><span data-key="t-menu">Menu</span></li>
                <li class="nav-item">
                    <a class="nav-link menu-link" href="{{ route('dashboard') }}" role="button" aria-expanded="false" aria-controls="sidebarDashboards">
                        <i class="ri-dashboard-2-line"></i><span data-key="t-dashboard">Dashboards</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link" href="#sidebarTasks" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarDashboards">
                        <i class="ri-todo-line"></i><span data-key="t-tasks">Tasks</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarTasks">
                        <ul class="nav nav-sm flex-column">
                            @can('showTasks')
                                <li class="nav-item">
                                    <a href="{{ route('showTasks') }}" class="nav-link" data-key="t-all-tasks"><i class="ri-order-play-line"></i> All Tasks </a>
                                </li>
                                <li class="nav-item">
                                    <a href="{{ route('showDailySummary') }}" class="nav-link" data-key="t-all-tasks"><i class="ri-order-play-line"></i> Daily Summary </a>
                                </li>
                            @endcan
                            @can('showTasksSE')
                                <li class="nav-item">
                                    <a href="{{ route('showTasksSE') }}" class="nav-link" data-key="t-all-tasks"><i class="ri-order-play-line"></i> All Tasks </a>
                                </li>
                                <li class="nav-item">
                                    <a href="{{ route('showDailySummarySE') }}" class="nav-link" data-key="t-all-tasks"><i class="ri-order-play-line"></i> Daily Summary </a>
                                </li>
                            @endcan
                            @can('importTasks')
                                <li class="nav-item">
                                    <a href="{{ route('importTasks') }}" class="nav-link" data-key="t-add-tasks"><i class="ri-play-list-add-line"></i> Add Tasks </a>
                                </li>
                            @endcan
                        </ul>
                    </div>
                </li>
                @role('admin')
                <li class="nav-item">
                    <a class="nav-link menu-link" href="#sidebarUsers" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarDashboards">
                        <i class="ri-group-2-line"></i><span data-key="t-tasks">Team</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarUsers">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('team') }}" class="nav-link" data-key="t-all-users"><i class="ri-team-line"></i> All Members </a>
                            </li>
                        </ul>
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('showWorkLocations') }}" class="nav-link" data-key="t-all-users"><i class="bx bx-user-check"></i> Jurisdiction Areas </a>
                            </li>
                        </ul>
                    </div>
                </li>
                @endrole
                @role('admin')
                <li class="nav-item">
                    <a class="nav-link menu-link" href="#sidebarQCReports" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarDashboards">
                        <i class="ri-survey-line"></i><span data-key="t-tasks">QC Reports</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarQCReports">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('showNCRs') }}" class="nav-link"><i class="ri-file-warning-line"></i> All NCRs </a>
                            </li>
                        </ul>
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('showObjections') }}" class="nav-link"><i class=" ri-error-warning-line"></i> All Objections </a>
                            </li>
                        </ul>
                    </div>
                </li>
                @endrole
                @role('se')
                <li class="nav-item">
                    <a class="nav-link menu-link" href="#sidebarQCReports" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarQCReports">
                        <i class="ri-survey-line"></i><span data-key="t-tasks">QC Reports</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarQCReports">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('showNCRs') }}" class="nav-link"><i class="ri-file-warning-line"></i> All NCRs </a>
                            </li>
                        </ul>
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('showObjections') }}" class="nav-link"><i class=" ri-error-warning-line"></i> All Objections </a>
                            </li>
                        </ul>
                    </div>
                </li>
                @endrole
                @role('admin')
                <li class="nav-item">
                    <a class="nav-link menu-link" href="#sidebarPayroll" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarPayroll">
                        <i class="lab la-amazon-pay"></i><span data-key="t-tasks">Payroll</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarPayroll">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a href="{{ route('showAttendance') }}" class="nav-link" data-key="t-all-users"><i class="bx bx-user-check"></i> Attendance </a>
                            </li>
                        </ul>
                    </div>
                </li>
                @endrole
                @role('admin')
                <li class="nav-item">
                    <a class="nav-link menu-link" href="#sidebarSettings" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarSettings">
                        <i class="lab la-amazon-pay"></i><span data-key="t-tasks">Settings</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarSettings">

                    </div>
                </li>
                @endrole
            </ul>
        </div>
        <!-- Sidebar -->
    </div>

    <div class="sidebar-background"></div>
</div>
