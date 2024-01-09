import {MemberData} from "../PageSearch/SearchOptions/reducer";
import {blankMember} from "../__mocks__/membersMock";
import {SubscriberJob} from "../Types";
import produce from "immer";
import {fillArrays} from "../hooks/fillArraysV2";

const processSubscriberJob = (state: MemberData) => {
    // @ts-ignore
    const blankTemplate: SubscriberJob = blankMember.memberDetail.memberAffiliationList[0].subscriberJobList[0];
    const isEqual = (a: SubscriberJob, b: SubscriberJob) => {
        return a.effectiveDate === b.effectiveDate;
    }
    const isBefore = (a: SubscriberJob, b: SubscriberJob): boolean => {
        return a.effectiveDate > b.effectiveDate;
    }

    const sourceData = state.source.memberDetail.memberAffiliationList[0].subscriberJobList;
    const targetData = state.target.memberDetail.memberAffiliationList[0].subscriberJobList;
    const [s, t] = fillArrays<SubscriberJob>('subscriberJobList', [sourceData, targetData], blankTemplate, isEqual, isBefore, [], [], true);

    return produce(state, (draft: MemberData) => {
        draft.source.memberDetail.memberAffiliationList[0].subscriberJobList = s;
        draft.target.memberDetail.memberAffiliationList[0].subscriberJobList = t;
    });
}

export default processSubscriberJob;
