

<!doctype html>
<html lang="en" data-layout="semibox" data-sidebar-visibility="show" data-topbar="light" data-sidebar="light" data-sidebar-size="lg" data-sidebar-image="none" data-preloader="disable">

@include('layouts.head')

<body>
<!--preloader-->
<div id="preloader" style="opacity: 1; visibility: visible;">
    <div id="status">
        <div class="spinner-border text-primary avatar-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
</div>

<div class="auth-page-wrapper pt-5">
    <!-- auth page bg -->
    <div class="auth-one-bg-position auth-one-bg" id="auth-particles">
        <div class="bg-overlay"></div>

        <div class="shape">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1440 120">
                <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
            </svg>
        </div>
    </div>

    <!-- auth page content -->
    <div class="auth-page-content">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="text-center mt-sm-5 mb-4 text-white-50">
                        <div>
                            <a href="{{route('dashboard')}}" class="d-inline-block auth-logo">
                                <img src="assets/images/logo.png" alt="" height="100">
                            </a>
                        </div>
                        <p class="mt-3 fs-15 fw-medium">Daily Task Management</p>
                    </div>
                </div>
            </div>
            <!-- end row -->

            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6 col-xl-5">
                    <div class="card mt-4">

                        <div class="card-body p-4">
                            <div class="text-center mt-2">
                                <h5 class="text-primary">Welcome Back !</h5>
                                <p class="text-muted">Sign in to continue</p>
                            </div>
                            <div class="p-2 mt-4">
                                <form method="POST" action="{{ route('login') }}">
                                    @csrf

                                    <!-- Email Address -->
                                    <div class="mb-3">
                                        <label for="email" :value="__('Email')" class="form-label">Email</label>
                                        <input id="email" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" class="form-control" placeholder="Enter email address">
                                        <x-input-error :messages="$errors->get('email')" class="mt-2" />
                                    </div>

                                    <!-- Password -->

                                    <div class="mb-3">
                                        @if (Route::has('password.request'))
                                        <div class="float-end">
                                            <a href="{{ route('password.request') }}" class="text-muted">{{ __('Forgot your password?') }}</a>
                                        </div>
                                        @endif
                                        <label class="form-label" for="password" :value="__('Password')">Password</label>
                                        <div class="position-relative auth-pass-inputgroup mb-3">
                                            <input  type="password" class="form-control pe-5 password-input" placeholder="Enter password" id="password"
                                                    name="password"
                                                    required autocomplete="current-password">
                                            <button class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon" type="button" id="password-addon"><i class="ri-eye-fill align-middle"></i></button>
                                        </div>
                                        <x-input-error :messages="$errors->get('password')" class="mt-2" />
                                    </div>



                                    <div class="form-check">
                                        <input name="remember" class="form-check-input" type="checkbox" value="" id="remember_me">
                                        <label class="form-check-label" for="auth-remember-check">{{ __('Remember me') }}</label>
                                    </div>

                                    <div class="mt-4">
                                        <button class="btn btn-secondary w-100" type="submit">{{ __('Log in') }}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <!-- end card body -->
                    </div>
                    <!-- end card -->

                </div>
            </div>
            <!-- end row -->
        </div>
        <!-- end container -->
    </div>
    <!-- end auth page content -->

    <!-- footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="text-center">
                        <p class="mb-0 text-muted">&copy;
                            <script>document.write(new Date().getFullYear())</script> Emam Hosen. Crafted with <i class="mdi mdi-heart text-danger"></i>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    <!-- end Footer -->
</div>
<!-- end auth-page-wrapper -->

<!-- JAVASCRIPT -->
@include('layouts.script')
</body>

<script>
    $( document ).ready(function() {
        var preloader = document.getElementById('preloader');
        preloader.style.opacity = '0'; // Set opacity to 1 to make it visible
        preloader.style.visibility = 'hidden'; // Set visibility to visible
    });

</script>

</html>
