import
{
  evaluateValueOfOffer,
} from "./tradeEvaluationFunctions";

import {localize} from "../localization/localize";

import
{
  Trade,
} from "../../../src/Trade";
import {TradeResponse} from "../../../src/TradeResponse";

export class EconomicAI
{
  public respondToTradeOffer(
    // TODO 09.06.2017 | rename
    incomingResponse: TradeResponse,
  ): TradeResponse
  {
    const receivedOffer = incomingResponse.proposedReceivedOffer;
    const ownTrade = incomingResponse.proposedOwnTrade;

    const offeredValue = evaluateValueOfOffer(receivedOffer);
    const ownValue = evaluateValueOfOffer(ownTrade);

    if (offeredValue === 0 && ownValue === 0)
    {
      return(
      {
        proposedOwnTrade: ownTrade.clone(),
        proposedReceivedOffer: receivedOffer.clone(),

        willingnessToTradeItems: this.getWillingnessToTradeItems(ownTrade),

        message: localize("requestOffer").format(),
        willingToAccept: false,
      });
    }
    else if (offeredValue === 0)
    {
      return this.respondToDemand(receivedOffer, ownTrade);
    }
    else if (ownValue === 0)
    {
      return this.respondToGift(receivedOffer, ownTrade);
    }

    const valueRatio = offeredValue / ownValue;
    const isFavourable = valueRatio > 1;
    const valueRatioDifference = Math.abs(1 - valueRatio);

    const willingToAccept = isFavourable || valueRatioDifference < 0.04;
    const message = willingToAccept ?
      localize("willingToAcceptOffer").format() :
      localize("notWillingToAcceptOffer").format();


    return(
    {
      proposedOwnTrade: ownTrade.clone(),
      proposedReceivedOffer: receivedOffer.clone(),

      willingnessToTradeItems: this.getWillingnessToTradeItems(ownTrade),

      message: message,
      willingToAccept: willingToAccept,
    });
  }

  private respondToDemand(
    receivedOffer: Trade,
    ownTrade: Trade,
  ): TradeResponse
  {
    return(
    {
      proposedOwnTrade: ownTrade.clone(),
      proposedReceivedOffer: receivedOffer.clone(),

      willingnessToTradeItems: this.getWillingnessToTradeItems(ownTrade),

      message: localize("notWillingToAcceptDemand").format(),
      willingToAccept: false,
    });
  }
  private respondToGift(
    receivedOffer: Trade,
    ownTrade: Trade,
  ): TradeResponse
  {
    return(
    {
      proposedOwnTrade: ownTrade.clone(),
      proposedReceivedOffer: receivedOffer.clone(),

      willingnessToTradeItems: this.getWillingnessToTradeItems(ownTrade),

      message: localize("willingToAcceptGift").format(),
      willingToAccept: true,
    });
  }
  private getWillingnessToTradeItems(
    ownTrade: Trade,
  ): {[key: string]: number}
  {
    // TODO 25.04.2017 | unimplemented
    const willingnessPerItem: {[key: string]: number} = {};

    for (let key in ownTrade.allItems)
    {
      willingnessPerItem[key] = 1;
    }

    return willingnessPerItem;
  }
}