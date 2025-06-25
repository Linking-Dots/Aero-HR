<?php

namespace App\Services\Notification;

use Google\Client as GoogleClient;
use Google\Service\Oauth2 as GoogleOauth2Service;
use Google\Service\Oauth2\Tokeninfo;
use Google\Service\FirebaseCloudMessaging as FirebaseCloudMessagingService;
use Google\Service\FirebaseCloudMessaging\SendMessageRequest;
use Google\Service\FirebaseCloudMessaging\AndroidConfig;
use Google\Service\FirebaseCloudMessaging\ApnsConfig;
use Google\Service\FirebaseCloudMessaging\Aps;
use Google\Service\FirebaseCloudMessaging\Message;
use Google\Service\FirebaseCloudMessaging\Notification as FcmNotification;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FcmNotificationService
{
    protected $client;
    protected $projectId;
    protected $serviceAccountPath;
    protected $accessToken;

    public function __construct()
    {
        $this->projectId = Config::get('services.firebase.project_id');
        $this->serviceAccountPath = Config::get('services.firebase.credentials.file');
        $this->initializeClient();
    }

    protected function initializeClient()
    {
        try {
            $this->client = new GoogleClient([
                'credentials' => $this->serviceAccountPath,
                'scopes' => ['https://www.googleapis.com/auth/firebase.messaging']
            ]);
            $this->client->setAuthConfig($this->serviceAccountPath);
            $this->client->addScope('https://www.googleapis.com/auth/firebase.messaging');
            $this->accessToken = $this->client->fetchAccessTokenWithAssertion();
        } catch (\Exception $e) {
            Log::error('FCM Client Initialization Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    protected function getAccessToken()
    {
        try {
            if ($this->client->isAccessTokenExpired()) {
                $this->accessToken = $this->client->fetchAccessTokenWithAssertion();
            }
            return $this->accessToken['access_token'] ?? null;
        } catch (\Exception $e) {
            Log::error('FCM Token Refresh Error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function sendNotification($deviceToken, $title, $body, $data = [])
    {
        Log::info('Sending FCM v1 notification', [
            'device_token' => $deviceToken,
            'title' => $title,
            'body' => $body,
            'data' => $data
        ]);

        if (empty($deviceToken)) {
            Log::error('FCM Notification Error: Device token is empty');
            return false;
        }

        try {
            $message = $this->createMessage($deviceToken, $title, $body, $data);
            $accessToken = $this->getAccessToken();

            $client = new \GuzzleHttp\Client([
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ]
            ]);

            $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";

            $response = $client->post($url, [
                'json' => ['message' => $message]
            ]);

            $responseBody = json_decode($response->getBody()->getContents(), true);

            Log::debug('FCM v1 Notification Sent', [
                'message_id' => $responseBody['name'] ?? null,
                'fcm_token' => $deviceToken
            ]);

            return true;
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $response = $e->getResponse();
            $responseBody = json_decode($response->getBody()->getContents(), true);

            Log::error('FCM v1 Client Error', [
                'status_code' => $response->getStatusCode(),
                'error' => $responseBody['error'] ?? $e->getMessage(),
                'fcm_token' => $deviceToken
            ]);

            // Handle token invalidation if needed
            if (
                $response->getStatusCode() === 404 ||
                (isset($responseBody['error']['status']) && $responseBody['error']['status'] === 'NOT_FOUND')
            ) {
                $this->handleInvalidToken($deviceToken);
            }

            return false;
        } catch (\Exception $e) {
            Log::error('FCM v1 Notification Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'fcm_token' => $deviceToken
            ]);
            return false;
        }
    }

    protected function createMessage($deviceToken, $title, $body, $data = [])
    {
        // Create notification payload
        $notification = new FcmNotification();
        $notification->setTitle($title);
        $notification->setBody($body);

        // Create message
        $message = new Message();
        $message->setToken($deviceToken);
        $message->setNotification($notification);

        // Set data payload if provided
        if (!empty($data)) {
            $message->setData($data);
        }

        // Android specific configuration
        $androidConfig = new AndroidConfig();
        $androidConfig->setPriority('high');
        $message->setAndroid($androidConfig);

        // iOS specific configuration
        $aps = new Aps();
        $aps->setContentAvailable(true);
        $apnsConfig = new ApnsConfig();
        $apnsConfig->setAps($aps);
        $message->setApns($apnsConfig);

        return $message;
    }

    protected function handleInvalidToken($deviceToken)
    {
        // Here you can add logic to handle invalid/expired tokens
        // For example, remove the token from your database
        Log::warning('Invalid FCM token detected', [
            'fcm_token' => $deviceToken,
            'action' => 'Token should be removed from database'
        ]);

        // Example: User::where('fcm_token', $deviceToken)->update(['fcm_token' => null]);
    }
}
