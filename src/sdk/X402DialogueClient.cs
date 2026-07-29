using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class X402DialogueClient : MonoBehaviour {
    public IEnumerator RequestDialogue(string apiUrl, string apiKey, string npcId, string context, System.Action<string> onResult) {
        // Create Request Payload
        string jsonPayload = $"{{\"npcId\":\"{npcId}\",\"context\":\"{context}\"}}";

        // 1. Send initial dialogue request
        UnityWebRequest req = new UnityWebRequest(apiUrl + "/api/generate-dialogue", "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);
        req.uploadHandler = new UploadHandlerRaw(bodyRaw);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Authorization", "Bearer " + apiKey);
        req.SetRequestHeader("Content-Type", "application/json");
        
        yield return req.SendWebRequest();

        // 2. Catch HTTP 402 Payment Required
        if (req.responseCode == 402) {
            string challengeJson = req.downloadHandler.text;
            
            // Sign the challenge using local Web3 wallet (e.g. MetaMask / Thirdweb / Embedded Wallet)
            string signature = SignChallengeWithWallet(challengeJson);
            
            // Simulating an on-chain transaction hash
            string txHash = "mock_tx_" + System.Guid.NewGuid().ToString("N");

            // Build settlement retry payload
            string retryPayload = $"{{\"npcId\":\"{npcId}\",\"requestId\":\"{ExtractRequestId(challengeJson)}\",\"signature\":\"{signature}\",\"transactionHash\":\"{txHash}\"}}";

            // 3. Resubmit with signature and transaction hash
            UnityWebRequest settleReq = new UnityWebRequest(apiUrl + "/api/generate-dialogue", "POST");
            byte[] retryRaw = System.Text.Encoding.UTF8.GetBytes(retryPayload);
            settleReq.uploadHandler = new UploadHandlerRaw(retryRaw);
            settleReq.downloadHandler = new DownloadHandlerBuffer();
            settleReq.SetRequestHeader("Authorization", "Bearer " + apiKey);
            settleReq.SetRequestHeader("Content-Type", "application/json");
            
            yield return settleReq.SendWebRequest();

            onResult?.Invoke(settleReq.downloadHandler.text);
        } else {
            onResult?.Invoke(req.downloadHandler.text);
        }
    }

    private string SignChallengeWithWallet(string challengeJson) {
        // In actual implementation, invoke your Web3 provider/signer:
        // return Web3Signer.SignMessage(challengeJson);
        return "0x_mock_signature_from_unity_wallet";
    }

    private string ExtractRequestId(string json) {
        // Quick regex helper to parse requestId from challenge JSON
        var match = System.Text.RegularExpressions.Regex.Match(json, "\"requestId\":\"([^\"]+)\"");
        return match.Success ? match.Groups[1].Value : "";
    }
}
