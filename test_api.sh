#!/bin/bash

echo "🧪 Testování Task API"
echo "===================="
echo ""

# Barvy pro výstup
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3000/api"
PROJECT_ID=1

echo "1. GET - Načtení tasků pro projekt $PROJECT_ID"
echo "-----------------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_BASE/projects/$PROJECT_ID/tasks")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ GET úspěšný (HTTP $HTTP_CODE)${NC}"
    TASK_COUNT=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
    echo "   Načteno tasků: $TASK_COUNT"
else
    echo -e "${RED}✗ GET selhal (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo "2. POST - Vytvoření nového tasku"
echo "---------------------------------"
POST_DATA='{"title":"API Test Task","description":"Testování přes API skript","priority":"High"}'
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_BASE/projects/$PROJECT_ID/tasks" \
  -H "Content-Type: application/json" \
  -d "$POST_DATA")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ POST úspěšný (HTTP $HTTP_CODE)${NC}"
    TASK_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', 'N/A'))" 2>/dev/null || echo "N/A")
    echo "   Vytvořen task s ID: $TASK_ID"
    LAST_TASK_ID=$TASK_ID
else
    echo -e "${RED}✗ POST selhal (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $BODY"
    LAST_TASK_ID=""
fi
echo ""

if [ -n "$LAST_TASK_ID" ] && [ "$LAST_TASK_ID" != "N/A" ]; then
    echo "3. PUT - Aktualizace tasku ID $LAST_TASK_ID"
    echo "-------------------------------------------"
    PUT_DATA='{"title":"Updated API Test Task","description":"Upravený popis","priority":"Medium","status_id":2}'
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$API_BASE/projects/$PROJECT_ID/tasks/$LAST_TASK_ID" \
      -H "Content-Type: application/json" \
      -d "$PUT_DATA")
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PUT úspěšný (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}✗ PUT selhal (HTTP $HTTP_CODE)${NC}"
        echo "   Response: $BODY"
    fi
    echo ""
    
    echo "4. DELETE - Smazání tasku ID $LAST_TASK_ID"
    echo "-------------------------------------------"
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X DELETE "$API_BASE/projects/$PROJECT_ID/tasks/$LAST_TASK_ID")
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ DELETE úspěšný (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}✗ DELETE selhal (HTTP $HTTP_CODE)${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠ Přeskočeno PUT a DELETE (task se nepodařilo vytvořit)${NC}"
    echo ""
fi

echo "5. Testování validace (neplatná priority)"
echo "------------------------------------------"
INVALID_DATA='{"title":"Invalid Test","description":"Test","priority":"Invalid"}'
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_BASE/projects/$PROJECT_ID/tasks" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Validace funguje správně (HTTP 400)${NC}"
else
    echo -e "${YELLOW}⚠ Očekával se HTTP 400, ale dostali jsme HTTP $HTTP_CODE${NC}"
fi
echo ""

echo "===================="
echo "Testování dokončeno!"
