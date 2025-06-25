<?php

namespace App\Services\Notification;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class FcmNotificationService
{
    protected $client;
    protected $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = Config::get('firebase.api_key');
    }

    public function sendNotification($deviceToken, $title, $body, $data = [])
    {
        if (empty($deviceToken)) {
            return false;
        }

        try {
            $response = $this->client->post('https://fcm.googleapis.com/fcm/send', [
                'headers' => [
                    'Authorization' => 'key=' . $this->apiKey,
                    'Content-Type' => 'application/json'
                ],
                'json' => [
                    'to' => $deviceToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                        'icon' => 'ic_notification'
                    ],
                    'data' => $data
                ]
            ]);

            $result = json_decode($response->getBody(), true);
            
            if (isset($result['success']) && $result['success'] === 1) {
                return true;
            }

            Log::error('FCM Notification Failed', [
                'device_token' => $deviceToken,
                'response' => $result
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('FCM Notification Error', [
                'device_token' => $deviceToken,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
