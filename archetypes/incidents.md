---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
summary: "Tek cümlelik özet: kim, neyi, nasıl kırdı."
incident_date: 2026-01-01        # olayın kamuya açıklandığı gün
org: "Kurum · Ürün"
severity: high                   # low | medium | high | critical
cvss: ""                         # varsa, ör. "9.3"; yoksa sil
status: confirmed                # confirmed | disputed
cve: ""                          # varsa; yoksa sil
buckets: ["ai-system-vulnerability"]   # ai-as-attacker | ai-system-vulnerability
owasp: ["LLM01"]                 # data/owasp.yaml'daki kimlikler
atlas: ["AML.T0051.001"]         # data/atlas.yaml'daki kimlikler
tags: []                         # serbest etiketler
chain:                           # saldırı zinciri: her adımda saldırı + onu kıracak savunma
  - attack: ""
    defense: ""
sources:
  - publisher: ""
    title: ""
    date: ""
    url: ""
---

## Ne oldu

Kısa özet ve zaman çizelgesi. Metin içinde kaynağa bağlan: [[1]](#src-1)

| Tarih | Olay |
|---|---|
| | |

## Tehdit

- **Saldırgan kim:**
- **Neye ulaşıyor:**
- **En kötü senaryo:**

## Açık neredeydi

Tam teknik zayıflık, ardından OWASP / ATLAS eşleme tablosu.

## Saldırgan gözüyle

Saldırı nasıl işledi, saldırgan sırada neyi dener. Çalışan payload yok.

## Nasıl düzelirdi

### a) Savunan taraf

### b) AI tarafı: ajan korumaları, yetkiler, izleme

## Ne öğrendim

- 3-4 kişisel satır.
