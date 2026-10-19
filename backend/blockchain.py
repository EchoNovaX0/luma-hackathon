import time
import hashlib
import json
from typing import Optional


class SimpleBlockchain:
    def __init__(self):
        self.chain = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        self.chain.append({
            "index": 0,
            "timestamp": int(time.time()),
            "data": {"message": "genesis_block"},
            "previous_hash": "0",
            "hash": self._calculate_hash(0, int(time.time()), {"message": "genesis_block"}, "0")
        })

    def _calculate_hash(self, index, timestamp, data, previous_hash):
        block_string = json.dumps({
            "index": index,
            "timestamp": timestamp,
            "data": data,
            "previous_hash": previous_hash
        }, sort_keys=True).encode()

        return hashlib.sha256(block_string).hexdigest()

    def record_analysis(self, audit_data: dict) -> dict:
        previous_block = self.chain[-1]

        block = {
            "index": len(self.chain),
            "timestamp": int(time.time()),
            "data": audit_data,
            "previous_hash": previous_block["hash"]
        }

        block["hash"] = self._calculate_hash(
            block["index"],
            block["timestamp"],
            block["data"],
            block["previous_hash"]
        )

        self.chain.append(block)
        return block


# One blockchain instance for the backend process
blockchain = SimpleBlockchain()


def record_analysis(
    image_hash: str,
    result_hash: str,
    prediction: str,
    probability: float,
    model_version: str
) -> dict:
    audit_data = {
        "image_hash": image_hash,
        "result_hash": result_hash,
        "prediction": prediction,
        "probability": probability,
        "model_version": model_version,
        "event": "XRAY_ANALYSIS_COMPLETED"
    }

    return blockchain.record_analysis(audit_data)


def verify_analysis(image_hash: str) -> Optional[dict]:
    for block in blockchain.chain:
        if block["data"].get("image_hash") == image_hash:
            return block
    return None